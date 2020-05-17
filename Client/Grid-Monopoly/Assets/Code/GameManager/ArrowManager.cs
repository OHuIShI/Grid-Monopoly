using Project.Networking;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ArrowManager : MonoBehaviour
{
    [SerializeField]
    private GameObject arrowPrefab;

    GameObject arrow1 = null;
    GameObject arrow2 = null;
    List<int> directions = new List<int>();
    bool clicked;
    bool timer = false;
    float _time = 0f;
    float waitTime = 3f;
    float userInput = -1f;
    NetworkIdentity client;
    Color playerColor = new Color();

    // Update is called once per frame
    void Update()
    {
        if(timer)
        {
            if(_time < waitTime)
            {
                _time += Time.deltaTime;

                playerColor.a = (waitTime - _time) / waitTime;

                arrow1.GetComponent<Renderer>().material.color = playerColor;
                arrow2.GetComponent<Renderer>().material.color = playerColor;
            }
            else
            {
                userInput = directions[UnityEngine.Random.Range(0, 2)];
                clicked = true;
            }

            if(clicked && NetworkClient.serverObjects[NetworkClient.ClientID].IsMyTurn())
            {
                timer = false;
                _time = 0;

                if(userInput == -1)
                {
                    Debug.Log("error : direction not selected");
                }
                else
                {
                    Debug.Log("emit selectDirection");
                    ArrowData returnData = new ArrowData();
                    returnData.selectedDIR = (int)userInput;
                    client.GetSocket().Emit("selectDirection", new JSONObject(JsonUtility.ToJson(returnData)));
                }
            }
        }
    }

    public void MakeArrow(NetworkIdentity ni, float mapSize, float x, float y)
    {
        client = ni;
        float halfLength = (int)(mapSize / 2);
        float arrowHeight = 0.1f;
        int _dir = 0;
        arrow1 = Instantiate(arrowPrefab, ni.transform);
        arrow2 = Instantiate(arrowPrefab, ni.transform);

        playerColor = ni.GetPlayerManager().getColor();
        playerColor = new Color(playerColor.r, playerColor.g, playerColor.b, 1);

        arrow1.GetComponent<Renderer>().material.color = playerColor;
        arrow2.GetComponent<Renderer>().material.color = playerColor;

        directions.Clear();


        if (Math.Abs(x) == halfLength && Math.Abs(y) == halfLength) // 코너에 있는 경우
        {
            if (x == halfLength) // 오른쪽 변의 코너 두개
            {
                _dir = 3;
                arrow1.transform.position += new Vector3(-1, arrowHeight, 0);
                arrow1.transform.rotation = Quaternion.Euler(new Vector3(90, 0, 90));
                arrow1.GetComponent<ArrowController>().dir = _dir;
                directions.Add(_dir);
            }
            else // 왼쪽 변의 코너 두개
            {
                _dir = 1;
                arrow1.transform.position += new Vector3(1, arrowHeight, 0);
                arrow1.transform.rotation = Quaternion.Euler(new Vector3(90, 0, -90));
                arrow1.GetComponent<ArrowController>().dir = _dir;
                directions.Add(_dir);
            }

            if (y == halfLength)
            {
                _dir = 2;
                arrow2.transform.position += new Vector3(0, arrowHeight, -1);
                arrow2.transform.rotation = Quaternion.Euler(new Vector3(90, 0, 180));
                arrow2.GetComponent<ArrowController>().dir = _dir;
                directions.Add(_dir);
            }
            else
            {
                _dir = 0;
                arrow2.transform.position += new Vector3(0, arrowHeight, 1);
                arrow2.transform.rotation = Quaternion.Euler(new Vector3(90, 0, 0));
                arrow2.GetComponent<ArrowController>().dir = _dir;
                directions.Add(_dir);
            }
        }
        else if (Math.Abs(x) == halfLength) // 왼쪽, 오른쪽 변에 있는 경우
        {
            _dir = 2;
            arrow1.transform.position += new Vector3(0, arrowHeight, -1);
            arrow1.transform.rotation = Quaternion.Euler(new Vector3(90, 0, 180));
            arrow1.GetComponent<ArrowController>().dir = _dir;
            directions.Add(_dir);

            _dir = 0;
            arrow2.transform.position += new Vector3(0, arrowHeight, 1);
            arrow2.transform.rotation = Quaternion.Euler(new Vector3(90, 0, 0));
            arrow2.GetComponent<ArrowController>().dir = _dir;
            directions.Add(_dir);
        }
        else if (Math.Abs(y) == halfLength) // 위, 아래 변에 있는 경우
        {
            _dir = 3;
            arrow1.transform.position += new Vector3(-1, arrowHeight, 0);
            arrow1.transform.rotation = Quaternion.Euler(new Vector3(90, 0, 90));
            arrow1.GetComponent<ArrowController>().dir = _dir;
            directions.Add(_dir);

            _dir = 1;
            arrow2.transform.position += new Vector3(1, arrowHeight, 0);
            arrow2.transform.rotation = Quaternion.Euler(new Vector3(90, 0, -90));
            arrow2.GetComponent<ArrowController>().dir = _dir;
            directions.Add(_dir);
        }


        _time = 0f;
        clicked = false;
        userInput = -1f;
        timer = true;
    }

    public void ClickedArrow(float dir)
    {
        clicked = true;
        userInput = dir;
    }

    public void DeleteArrow()
    {
        _time = 0f;
        clicked = false;
        userInput = -1f;
        timer = false;

        if(arrow1??false)
            Destroy(arrow1);
        if(arrow2??false)
            Destroy(arrow2);
    }

    [Serializable]
    public class ArrowData
    {
        public int selectedDIR;
    }
}