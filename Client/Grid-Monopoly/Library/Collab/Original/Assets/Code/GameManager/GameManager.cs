using Project;
using Project.Networking;
using Project.Utility.Attributes;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class GameManager : MonoBehaviour
{
    public float mapSize;

    public GameObject buildingUI;
    public Text buildingUI_Text_Title;
    public Text buildingUI_Text_Content;
    public Image buildingUI_LinearTimer;

    public GameObject diceUI;
    public GameObject diceUI_background;
    public Text diceUI_Dir_Result;
    public Text diceUI_Dist_Result;

    public GameObject sellTimerUI;
    public Image sellTimerUI_LinearTimer;

    public NetworkIdentity ni;
    public int landIndex;
    public Land currentLand;
    public GameObject arrowManager;

    MoneyData TollFeeData_AfterSell = new MoneyData();

    bool timer = false;
    float _time = 0;
    float waitTime = 10f;
    bool userInput = false;
    int clickedLand = -1;
    bool sellTimer = false;
    float _sellTime = 0;
    float sellWaitTime = 10f;
    bool positioning = false;
    Vector3 arrivalPoint = new Vector3(0, 0, 0);
    float dist = 0f;

    bool noticeTimer = false;
    float _noticeTime = 0f;
    float noticeWaitTime = 2f;

    public enum State { BuyLand, Contract, Building, Acquire, Sell }
    State state = State.BuyLand;

    Ray ray;
    RaycastHit hit;

    void Start()
    {
        buildingUI_Text_Title = buildingUI.transform.Find("BuildingUI_Text_Title").GetComponent<UnityEngine.UI.Text>();
        buildingUI_Text_Content = buildingUI.transform.Find("BuildingUI_Text_Content").GetComponent<UnityEngine.UI.Text>();
        buildingUI.SetActive(false);

        diceUI_background = diceUI.transform.Find("Background").gameObject;
        diceUI_Dir_Result = diceUI.transform.Find("Dir_Result").GetComponent<UnityEngine.UI.Text>();
        diceUI_Dist_Result = diceUI.transform.Find("Dist_Result").GetComponent<UnityEngine.UI.Text>();
        diceUI.SetActive(false);

        sellTimerUI.SetActive(false);
    }

    void Update()
    {
        ray = Camera.main.ScreenPointToRay(Input.mousePosition);

        if (Physics.Raycast(ray, out hit, 10.0f) && Input.GetMouseButtonDown(0))
        {
            if(!IsPointerOverUIObject(Input.mousePosition))
            {
                if (hit.collider.tag == "Land" && NetworkClient.serverObjects[NetworkClient.ClientID].IsMyTurn())
                {
                    string str = hit.collider.gameObject.name;
                    str = str.Substring(8);
                    clickedLand = int.Parse(str) - 1;
                    if (state == State.Sell) // 매각 상태일 때만 buildingUI 띄움
                    {
                        buildingUI.SetActive(true);
                    }
                    // 게임중 Land 클릭 시 상세 정보 보여주기?
                }
            }
        }

        // buildingUI timer -> 토지 구입, 빌딩 건설, 계약 체결, 매매 등
        if (timer)
        {
            if (_time < waitTime)
            {
                _time += Time.deltaTime;
                buildingUI_LinearTimer.fillAmount = (waitTime - _time) / waitTime;
                if (buildingUI.GetComponent<ButtonControler>().clicked)
                {
                    userInput = buildingUI.GetComponent<ButtonControler>().result;
                }
            }
            else
            {
                buildingUI.GetComponent<ButtonControler>().clicked = true;
            }
        }

        // 매각 타이머
        if (sellTimer)
        {
            if (_sellTime < sellWaitTime)
            {
                _sellTime += Time.deltaTime;
                sellTimerUI_LinearTimer.fillAmount = (sellWaitTime - _sellTime) / sellWaitTime;
                if (buildingUI.GetComponent<ButtonControler>().clicked)
                {
                    userInput = buildingUI.GetComponent<ButtonControler>().result;
                }
            }
            else
            {
                // 매각 타임 종료
                for (int i = 0; i < LandManager.lands.Length; i++)
                {
                    if (LandManager.lands[i].ownerID == NetworkClient.ClientID)
                    {
                        LandManager.lands[i].land.GetComponent<Outline>().OnDisable();
                    }
                }
                sellTimerUI.SetActive(false);

                _sellTime = 0;
                userInput = false;
                sellTimer = false;
                buildingUI.GetComponent<ButtonControler>().clicked = false;
                buildingUI.GetComponent<ButtonControler>().result = false;

                buildingUI.SetActive(false);

                if (ni.GetPlayerManager().getBalance() < TollFeeData_AfterSell.cost) //매각 타임이 끝났는데도 통행료 낼 돈을 마련하지 못함 -> 파산
                {
                    Debug.Log("after sell - bankrupt");
                    BankruptData bankrupt = new BankruptData();
                    bankrupt.id = NetworkClient.ClientID;
                    ni.GetSocket().Emit("GoBankrupt", new JSONObject(JsonUtility.ToJson(bankrupt)));
                }
                else
                {
                    Debug.Log("after sell - pay toll fee");
                    MoneyData moneyData = TollFeeData_AfterSell;
                    ni.GetSocket().Emit("updateBalance", new JSONObject(JsonUtility.ToJson(moneyData)));
                    //ni.GetSocket().Emit("turnOver");
                    NetworkClient.CallTurnOver(ni);
                }
            }
        }

        // 공지 타이머 -> 아무것도 할 수 없다는 것 공지
        if (noticeTimer)
        {
            if (_noticeTime < noticeWaitTime)
            {
                _noticeTime += Time.deltaTime;
                buildingUI_LinearTimer.fillAmount = (noticeWaitTime - _noticeTime) / noticeWaitTime;
            }
            else
            {
                noticeTimer = false;
                _noticeTime = 0;

                buildingUI.GetComponent<ButtonControler>().YesButton.gameObject.SetActive(true);
                buildingUI.GetComponent<ButtonControler>().NoButton.gameObject.SetActive(true);

                buildingUI.SetActive(false);

                //ni.GetSocket().Emit("turnOver");
                NetworkClient.CallTurnOver(ni);
            }
        }


        if (buildingUI.GetComponent<ButtonControler>().clicked)
        {
            // 처리 함수 call
            TakeOver(buildingUI.GetComponent<ButtonControler>().result, state);
            _time = 0;
            userInput = false;
            timer = false;
            buildingUI.GetComponent<ButtonControler>().clicked = false;
            buildingUI.GetComponent<ButtonControler>().result = false;
            buildingUI.SetActive(false);
        }

        // 부아앙씨 움직이려면 여기 필요함... 부아앙은 꼭 Update안에 들어있어야해서.. 일단 지금은 똑똑똑씨밖에 없으니 부아앙 코드는 주석처리..
        /*
        if(positioning)
        {
            
            // 부아앙
            float step = 1f * Time.deltaTime;
            ni.transform.position = Vector3.MoveTowards(ni.transform.position, arrivalPoint, step);
            

            // 부아앙은 선택 권한이 없음..
            if (Vector3.Distance(ni.transform.position, arrivalPoint) == 0)
            {
                Debug.Log("arrive");
                positioning = false;

                if (dist == 0 && ni.IsMyTurn())
                {
                    // 지금 당장은 turn 종료 코드
                    // 나중에는 여기에 인수 관련 함수 넣으면 됨
                    Debug.Log("call takeover");
                    this.CallTakeOver(arrivalPoint.x, arrivalPoint.z);
                    //Debug.Log("call turnover");
                }
                else if (dist != 0)
                {
                    Debug.Log("make arrow");
                    arrowManager.GetComponent<ArrowManager>().MakeArrow(ni,mapSize, arrivalPoint.x, arrivalPoint.z);
                }

        }
        */
    }

    IEnumerator MovePlayer(NetworkIdentity ni, Vector3 direction, Vector3 arrivalPoint)
    {
        Debug.Log("MovePlayer");

        while (Vector3.Distance(ni.transform.position, arrivalPoint) >= 0.0001f)
        {
            //Debug.Log("move player");
            ni.transform.position += direction;
            diceUI_Dist_Result.text = (Int32.Parse(diceUI_Dist_Result.text) - 1).ToString();
            if (Vector3.Distance(ni.transform.position, arrivalPoint) >= 0.0001f)
            {
                //Debug.Log("not arrive yet");
                yield return new WaitForSeconds(0.5f);
            }
            else
            {
                //Debug.Log("arrive, break while loop");
                break;
            }
        }
        positioning = false;

        if (dist == 0)
        {
            diceUI.SetActive(false);
        }

        if (dist == 0 && ni.IsMyTurn())
        {
            this.CallTakeOver(arrivalPoint.x, arrivalPoint.z);
        }
        else if (dist != 0)
        {
            Debug.Log("call make arrow");
            arrowManager.GetComponent<ArrowManager>().MakeArrow(ni, mapSize, arrivalPoint.x, arrivalPoint.z);
        }
        else
        {
            Debug.Log("error occured");
        }
    }

    public void UpdatePosition(NetworkIdentity ni, float DIR, float x, float y, float dist, float DIST)
    {
        Debug.Log("GameManager - UpdatePosition");
        Quaternion rotation = Quaternion.Euler(new Vector3(0, 0, 0));
        this.dist = dist;
        Vector3 direction = new Vector3(0, 0, 0);

        arrowManager.GetComponent<ArrowManager>().DeleteArrow();
        Debug.Log("delete arrow done");
        // 가야할 방향으로 player 고개 돌리기
        // 방향주사위 눈 {0 :북 1 :동 2 : 남 3 :서 }
        switch (DIR)
        {
            case 0: // 북쪽 -> +z
                rotation = Quaternion.Euler(new Vector3(0, 0, 0));
                direction = new Vector3(0, 0, 1);
                diceUI_Dir_Result.text = "N";
                break;
            case 1: // 동쪽 -> +x
                rotation = Quaternion.Euler(new Vector3(0, 90, 0));
                direction = new Vector3(1, 0, 0);
                diceUI_Dir_Result.text = "E";
                break;
            case 2: // 남쪽 -> -z
                rotation = Quaternion.Euler(new Vector3(0, 180, 0));
                direction = new Vector3(0, 0, -1);
                diceUI_Dir_Result.text = "S";
                break;
            case 3: // 서쪽 -> -x
                rotation = Quaternion.Euler(new Vector3(0, -90, 0));
                direction = new Vector3(-1, 0, 0);
                diceUI_Dir_Result.text = "W";
                break;
        }
        ni.transform.rotation = rotation;
        Debug.Log("set dir done");

        positioning = true;
        arrivalPoint = new Vector3(x, 0, y);
        this.ni = ni;

        Debug.Log("test 1");
        string[] dir = { "N", "E", "S", "W" };
        diceUI_background.GetComponent<Image>().color = ni.GetPlayerManager().getColor();
        diceUI_Dist_Result.text = DIST.ToString();
        diceUI_Dir_Result.text = dir[(int)DIR];
        Debug.Log("test 2");
        diceUI.SetActive(true);
        Debug.Log("start coroutine");
        // 똑똑똑
        StartCoroutine(MovePlayer(ni, direction, arrivalPoint));
    }

    public void CallTakeOver(float x, float y)
    {
        landIndex = (int)x - 5 * (int)y + 12;
        currentLand = LandManager.lands[landIndex];
        ni = NetworkClient.serverObjects[NetworkClient.ClientID];

        buildingUI_Text_Title.text = "";
        buildingUI_Text_Content.text = "";

        Debug.Log("TakeOver");
        if (currentLand.ownerID == "") //빈 땅 
        {
            Debug.Log("EMPTY LAND");
            if (ni.GetPlayerManager().getBalance() < currentLand.price.land)
            {
                InsufficientCash();
            }
            else
            {
                buildingUI_Text_Title.text = "토지를 매매하시겠습니까?";
                buildingUI_Text_Content.text = "토지 용도 : " + currentLand.name.ToString() + " 부지";
                buildingUI_Text_Content.text += "\n토지 비용 : " + currentLand.price.land.ToString();
                buildingUI_Text_Content.text += "\n토지 구매 이후 통행료 : " + (currentLand.price.land * 4).ToString();
                buildingUI_LinearTimer.color = ni.GetPlayerManager().getColor();
                buildingUI.SetActive(true);
                timer = true;
                state = State.BuyLand;
            }
        }
        else if (currentLand.ownerID == NetworkClient.ClientID) // 내 땅
        {
            Debug.Log("My Land");
            if (currentLand.status.contract)
            {
                InsufficientCash();
            }
            else if (currentLand.status.building)
            {
                Debug.Log("ask contract");
                if (currentLand.price.contract > ni.GetPlayerManager().getBalance()) // 계약할 돈 부족
                {
                    //ni.GetSocket().Emit("turnOver");
                    NetworkClient.CallTurnOver(ni);
                }
                else // 계약 가능
                {
                    buildingUI_Text_Title.text = "매매방지 계약을 체결하시겠습니까?";
                    buildingUI_Text_Content.text = "계약 비용 : " + currentLand.price.contract.ToString();
                    buildingUI_Text_Content.text += "계약 체결 이후 통행료 : " + ((currentLand.totalValue + currentLand.price.contract) * 4).ToString();
                    buildingUI_LinearTimer.color = ni.GetPlayerManager().getColor();
                    buildingUI.SetActive(true);
                    state = State.Contract;
                    timer = true;
                }
            }
            else if (currentLand.status.land)
            {
                Debug.Log("ask build building");
                if (currentLand.price.building > ni.GetPlayerManager().getBalance())
                {
                    InsufficientCash();
                }
                else // 건물 짓기 가능
                {
                    buildingUI_Text_Title.text = "건물을 건설하시겠습니까?";
                    buildingUI_Text_Content.text = "건물 용도 :" + currentLand.name.ToString();
                    buildingUI_Text_Content.text = "건설 비용 : " + currentLand.price.building.ToString();
                    buildingUI_Text_Content.text += "건물 건설 이후 통행료 : " + ((currentLand.totalValue + currentLand.price.land) * 4).ToString();
                    buildingUI_LinearTimer.color = ni.GetPlayerManager().getColor();
                    buildingUI.SetActive(true);
                    state = State.Building;
                    timer = true;
                }
            }
        }
        else if (currentLand.ownerID != NetworkClient.ClientID) // 남 땅
        {
            Debug.Log("not my land");
            int fee = 4 * currentLand.totalValue;
            if (ni.GetPlayerManager().getBalance() < fee)
            {
                // 자산 매각해도 통행료 못냄->파산
                if (ni.GetPlayerManager().getAssets() < fee)
                {
                    BankruptData bankrupt = new BankruptData();
                    bankrupt.id = NetworkClient.ClientID;
                    ni.GetSocket().Emit("GoBankrupt", new JSONObject(JsonUtility.ToJson(bankrupt)));
                }
                else
                {
                    // 매각 시작

                    for (int i = 0; i < LandManager.lands.Length; i++)
                    {
                        if (LandManager.lands[i].ownerID == NetworkClient.ClientID)
                        {
                            LandManager.lands[i].land.GetComponent<Outline>().OnEnable();
                            LandManager.lands[i].land.GetComponent<Outline>().UpdateMaterialProperties();
                        }
                    }

                    MoneyData moneyData = new MoneyData();
                    moneyData.cost = fee;
                    moneyData.senderID = NetworkClient.ClientID;
                    moneyData.receiverID = currentLand.ownerID;
                    TollFeeData_AfterSell = moneyData;

                    state = State.Sell;

                    buildingUI_Text_Title.text = "해당 토지를 매각하시겠습니까?";
                    sellTimerUI_LinearTimer.color = ni.GetPlayerManager().getColor();
                    sellTimerUI.SetActive(true);
                    sellTimer = true;
                }
            }
            else
            {
                MoneyData moneyData = new MoneyData();
                moneyData.cost = fee;
                moneyData.senderID = NetworkClient.ClientID;
                moneyData.receiverID = currentLand.ownerID;
                int currentBalance = ni.GetPlayerManager().getBalance();
                ni.GetSocket().Emit("updateBalance", new JSONObject(JsonUtility.ToJson(moneyData)));

                currentBalance -= fee;

                // 인수할래? UI 띄우기
                int cost = currentLand.totalValue * 2;
                if (currentBalance < cost)
                {
                    InsufficientCash();
                }
                else
                {
                    buildingUI_Text_Title.text = "해당 토지를 인수하시겠습니까?";
                    buildingUI_Text_Content.text = "인수 비용 : " + cost.ToString();
                    buildingUI_LinearTimer.color = ni.GetPlayerManager().getColor();
                    buildingUI.SetActive(true);
                    timer = true;
                    state = State.Acquire;
                }
            }
        }
    }

    void InsufficientCash()
    {
        buildingUI_Text_Title.text = "잔액이 부족합니다.";
        buildingUI_Text_Content.text = "다음 턴으로 넘어갑니다.";
        buildingUI.GetComponent<ButtonControler>().YesButton.gameObject.SetActive(false);
        buildingUI.GetComponent<ButtonControler>().NoButton.gameObject.SetActive(false);
        noticeTimer = true;
        buildingUI.SetActive(true);
    }

    public void TakeOver(bool result, State _state)
    {
        if (!result)
        {
            // turnover 넘기기
            //ni.GetSocket().Emit("turnOver");
            NetworkClient.CallTurnOver(ni);
        }
        else
        {
            MoneyData moneyData = new MoneyData();
            LandData landData = new LandData();
            switch (_state)
            {
                case State.BuyLand:
                    Debug.Log("TakeOver - BuyLand");
                    moneyData.cost = currentLand.price.land;
                    moneyData.senderID = NetworkClient.ClientID;
                    moneyData.receiverID = "";
                    landData.state = "BuyLand";
                    landData.landIndex = landIndex;
                    landData.id = NetworkClient.ClientID;
                    ni.GetSocket().Emit("updateBalance", new JSONObject(JsonUtility.ToJson(moneyData)));
                    ni.GetSocket().Emit("updateLandData", new JSONObject(JsonUtility.ToJson(landData)));
                    //ni.GetSocket().Emit("turnOver");
                    NetworkClient.CallTurnOver(ni);
                    break;
                case State.Building:
                    Debug.Log("TakeOver - Building");
                    landData.landIndex = landIndex;
                    landData.state = "Building";
                    moneyData.senderID = currentLand.ownerID;
                    moneyData.cost = currentLand.price.building;
                    ni.GetSocket().Emit("updateLandData", new JSONObject(JsonUtility.ToJson(landData)));
                    ni.GetSocket().Emit("updateBalance", new JSONObject(JsonUtility.ToJson(moneyData)));
                    //ni.GetSocket().Emit("turnOver");
                    NetworkClient.CallTurnOver(ni);
                    break;
                case State.Contract:
                    Debug.Log("TakeOver - Contract");
                    landData.landIndex = landIndex;
                    landData.state = "Contract";
                    moneyData.senderID = currentLand.ownerID;
                    moneyData.cost = currentLand.price.contract;
                    ni.GetSocket().Emit("updateLandData", new JSONObject(JsonUtility.ToJson(landData)));
                    ni.GetSocket().Emit("updateBalance", new JSONObject(JsonUtility.ToJson(moneyData)));
                    //ni.GetSocket().Emit("turnOver");
                    NetworkClient.CallTurnOver(ni);
                    break;
                case State.Acquire:
                    Debug.Log("TakeOver - Acquire");
                    moneyData.cost = currentLand.totalValue * 2;
                    moneyData.senderID = NetworkClient.ClientID;
                    moneyData.receiverID = currentLand.ownerID;
                    landData.state = "Acquire";
                    landData.landIndex = landIndex;
                    landData.id = NetworkClient.ClientID;
                    ni.GetSocket().Emit("updateBalance", new JSONObject(JsonUtility.ToJson(moneyData)));
                    ni.GetSocket().Emit("updateLandData", new JSONObject(JsonUtility.ToJson(landData)));
                    //ni.GetSocket().Emit("turnOver");
                    NetworkClient.CallTurnOver(ni);
                    break;
                case State.Sell:
                    Debug.Log("TakeOver - sell");
                    landIndex = clickedLand;
                    LandManager.lands[landIndex].land.GetComponent<Outline>().OnDisable();

                    moneyData.cost = currentLand.totalValue;
                    moneyData.receiverID = NetworkClient.ClientID;
                    landData.state = "Sell";
                    landData.landIndex = landIndex;
                    landData.id = "";
                    ni.GetSocket().Emit("updateBalance", new JSONObject(JsonUtility.ToJson(moneyData)));
                    ni.GetSocket().Emit("updateLandData", new JSONObject(JsonUtility.ToJson(landData)));
                    break;
            }
        }
    }

    public bool IsPointerOverUIObject(Vector2 touchPos)
    {
        PointerEventData eventDataCurrentPosition
            = new PointerEventData(EventSystem.current);

        eventDataCurrentPosition.position = touchPos;

        List<RaycastResult> results = new List<RaycastResult>();


        EventSystem.current
        .RaycastAll(eventDataCurrentPosition, results);

        return results.Count > 0;
    }


    [Serializable]
    public class LandData
    {
        public int landIndex;
        public string state;
        public string id;
    }

    [Serializable]
    public class MoneyData
    {
        public string senderID;
        public string receiverID;
        public int cost;
    }

    [Serializable]
    public class BankruptData
    {
        public string id;
    }
}


