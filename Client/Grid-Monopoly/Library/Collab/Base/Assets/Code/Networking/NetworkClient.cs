using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;
using Project.Utility;
using System;
using Project.Utility.Attributes;
using Project.UserInterface;
using static Project.BlockChain.BlockChainManager;
using Project.Managers;

namespace Project.Networking
{
    public class NetworkClient : SocketIOComponent
    {
       // 얜 뭐지?
        //public const float SERVER_UPDATE_TIME = 10;
        public static Action<SocketIOEvent> OnGameStateChange = (E) => { };

        [Header("Network Client")]
        [SerializeField]
        private Transform networkContainer;
        [SerializeField]
        private GameObject playerPrefab;

        public GameObject RollButton;
        public GameObject gameManager;
        public GameObject landManager;
        public GameObject blockchainManager;
        public GameObject LevelCanvas;
        public GameObject UserInfo;
        public GameObject gameLobby;
        public GameObject menu;

        public static string ClientID { get; private set; }

        public static Dictionary<string, NetworkIdentity> serverObjects;

        // Start is called before the first frame update
        public override void Start()
        {
            base.Start();
            initialize();
            setupEvents();
        }

        // Update is called once per frame

        public override void Update()
        {
            base.Update();
            /*
            UserInfo = GameObject.FindGameObjectWithTag("LevelCanvas");
            if (UserInfo == null)
                Debug.Log("cannot found");
            else
                Debug.Log("found canvas");
            */
        }

        private void initialize()
        {
            serverObjects = new Dictionary<string, NetworkIdentity>();
        }

        private void setupEvents()
        {
            On("open", (E) =>
            {
                Debug.Log("Connection made to the server");
            });

            On("register", (E) =>
            {
                menu = GameObject.FindGameObjectWithTag("MainMenu");
                ClientID = E.data["id"].ToString().RemoveQuotes();
                Debug.LogFormat("Our Client's ID ({0})", ClientID);
                // local storage 에 유저 기록이 있는지 확인 후 없다면
                menu.GetComponent<MenuManager>().setInputPanel("Enter your name");
            });

            On("setBlockChain", (E) =>
            {
                Debug.Log("setBlockChain");
                SetGenesis(E);
                Debug.Log("done setBlockChain");
            });

            On("initializeGameSetting", (E) =>
            {
                //initialize game field 
                LevelCanvas = GameObject.FindGameObjectWithTag("LevelCanvas");
                UserInfo = LevelCanvas.transform.Find("UserInfo").gameObject;
                RollButton = LevelCanvas.transform.Find("RollButton").gameObject;
                gameManager = GameObject.FindGameObjectWithTag("GameManager");
                landManager = GameObject.FindGameObjectWithTag("LandManager");
                landManager.GetComponent<LandManager>().initializeLandSettings();
            });

            On("spawn", (E) =>
            {
                //Handling all spawning all players
                //Passed Data
                string id = E.data["id"].ToString().RemoveQuotes();
                int order = Int32.Parse(E.data["order"].ToString().RemoveQuotes());
                string username = E.data["username"].ToString().RemoveQuotes();
                GameObject go = Instantiate(playerPrefab, networkContainer);
                go.name = string.Format("Player ({0})", username);
                GameObject playerCharacter = go.transform.GetChild(order).gameObject;
                playerCharacter.SetActive(true);

                NetworkIdentity ni = go.GetComponent<NetworkIdentity>();
                ni.GetPlayerManager().setAnimator(playerCharacter.GetComponent<Animator>());
                Debug.Log("succesfully set animation");
                ni.GetPlayerManager().setColor(playerCharacter.transform.Find("Color").gameObject.GetComponent<Renderer>().material.color);
                ni.GetPlayerManager().setUserInfo(UserInfo.transform.GetChild(order).gameObject, username);

                ni.GetPlayerManager().setAssets(Int32.Parse(E.data["assets"].ToString().RemoveQuotes()));
                ni.GetPlayerManager().setBalance(Int32.Parse(E.data["balance"].ToString().RemoveQuotes()));

                ni.SetControllerID(id);
                ni.SetSocketReference(this);

                serverObjects.Add(id, ni);
                Debug.Log("spawn complete");
            });

            On("disconnected", (E) =>
            {
                string id = E.data["id"].ToString().RemoveQuotes();

                GameObject go = serverObjects[id].gameObject;
                Destroy(go); //Remove from game
                serverObjects.Remove(id); //Remove from memory
            });

            On("updatePosition", (E) =>
            {
                Data D = SetNextBlock(E);
                string id = D.eventData["id"].ToString().RemoveQuotes();
                float DIR = D.eventData["DIR"].f; // 방향주사위 눈 {0 :북 1 :동 2 : 남 3 :서 }
                float DIST = D.eventData["DIST"].f; // 거리주사위 눈 
                float x = D.eventData["x"].f; // 당장 가야할 dx (항상 양수)
                float y = D.eventData["y"].f; // 당장 가야할 dy (항상 양수)
                float dist = D.eventData["dist"].f; // 남은 이동 거리 횟수
                Debug.Log("updatePosition");

                NetworkIdentity ni = serverObjects[id];
                gameManager.GetComponent<GameManager>().UpdatePosition(ni, DIR, x, y, dist, DIST);
            });
            On("updateBalance", (E) =>
            {
                Debug.Log("updateBalanece");
                Data D = SetNextBlock(E);
                string sender = D.eventData["senderID"].ToString().RemoveQuotes();
                string receiver = D.eventData["receiverID"].ToString().RemoveQuotes();
                if(receiver != "")
                {
                    NetworkIdentity receiver_ni = serverObjects[receiver];
                    receiver_ni.GetPlayerManager().Deposit(Int32.Parse(D.eventData["cost"].ToString().RemoveQuotes()));
                    receiver_ni.GetPlayerManager().setAssets(Int32.Parse(D.eventData["receiverAssets"].ToString().RemoveQuotes()));
                }
                if(sender != "")
                {
                    NetworkIdentity sender_ni = serverObjects[sender];
                    sender_ni.GetPlayerManager().Withdraw(Int32.Parse(D.eventData["cost"].ToString().RemoveQuotes()));
                    sender_ni.GetPlayerManager().setAssets(Int32.Parse(D.eventData["senderAssets"].ToString().RemoveQuotes()));
                }                
            });
            On("updateLandData", (E) =>
            {
                Debug.Log("call updateLandData");
                Data D = SetNextBlock(E);
                Debug.Log("after SetNextBlock");
                Debug.Log(D);
                landManager.GetComponent<LandManager>().updateLandData(D);
            });
            // 1 Turn Start
            On("updateTurn", (E) =>
            {
                Data D = SetNextBlock(E);
                string id = D.eventData["id"].ToString().RemoveQuotes();
                int lapsToGo = Int32.Parse(D.eventData["lapsToGo"].ToString().RemoveQuotes());
                gameManager.GetComponent<GameManager>().UpdateTurn(lapsToGo);
                NetworkIdentity ni = serverObjects[id];
                ni.checkIsMyTurn(id);
                Debug.Log("updateTurn");

                if (ni.IsMyTurn())
                {
                    Debug.Log("ISmYTURN");
                    RollButton.GetComponent<RollDices>().StartRoll();
                }
            });
            On("gameOver", (E) =>
            {
                Debug.Log("On GAME OVER");
                Data D = SetNextBlock(E);
                gameManager.GetComponent<GameManager>().UpdateTurn(0);
                gameManager.GetComponent<GameManager>().GameOver(D);
            });
            On("GoBankrupt", (E) =>
            {
                Data D = SetNextBlock(E);
                string id = D.eventData["id"].ToString().RemoveQuotes();
                NetworkIdentity ni = serverObjects[id];
                if (id == ClientID)
                {
                    CallTurnOver(ni);
                }
                ni.GetPlayerManager().setAssets(0);
                ni.GetPlayerManager().setBalance(0);
                landManager.GetComponent<LandManager>().resetLandSettings(id);
                ni.GetPlayerManager().SetUserState("BANKRUPT");
            });
            On("loadGame", (E) =>
            {
                Debug.Log("Switching to game");
                StartCoroutine(SceneManagementManager.Instance.LoadLevel(SceneList.LEVEL, (levelName) => {
                    SceneManagementManager.Instance.UnLoadLevel(SceneList.MAIN_MENU);
                },this));
            });
            On("OnEnterGameLobby", (E) => {
                
                int index = Int32.Parse(E.data["index"].ToString().RemoveQuotes());
                string id = E.data["id"].ToString().RemoveQuotes();
                string name = E.data["name"].ToString().RemoveQuotes();
                gameLobby.GetComponent<GameLobby>().OnEnterPlayer(index, id, name);
            });
            On("lobbyUpdate", (E) => {
                OnGameStateChange.Invoke(E);
            });
            On("changedReadyState", (E) =>
            {
                int index = Int32.Parse(E.data["index"].ToString().RemoveQuotes());
                //string id = E.data["id"].ToString().RemoveQuotes();
                bool state = Boolean.Parse(E.data["state"].ToString().RemoveQuotes());
                gameLobby.GetComponent<GameLobby>().setPlayerState(index, state);
            });
            On("signupResult", (E) =>
            {
                string result = E.data["result"].ToString().RemoveQuotes();
                switch (result)
                {
                    case "success":
                        menu.GetComponent<MenuManager>().setLobbyPanel();
                        break;
                    case "exist":
                        menu.GetComponent<MenuManager>().setInputPanel("exist name!");
                        break;
                }
            });
        }
    
        public void AttemptToJoinLobby()
        {
            Emit("joinGame");
        }
        public void EnteredGame()
        {
            Emit("enteredGame");
        }
        public void SwitchReadyState()
        {
            ReadyState data = new ReadyState();
            data.state = gameLobby.GetComponent<GameLobby>().OnSwitchReadyState();
            Emit("onSwitchReadyState", new JSONObject(JsonUtility.ToJson(data)));
        }
        public void GoBackToGameLobby()
        {
            Debug.Log("go back to game lobby");
            gameLobby.GetComponent<GameLobby>().switchGameLobby();
            SceneManagementManager.Instance.UnLoadLevel(SceneList.LEVEL);
            /*
            StartCoroutine(SceneManagementManager.Instance.LoadLevel(SceneList.ONLINE, (levelName) => {
                SceneManagementManager.Instance.UnLoadLevel(SceneList.LEVEL);
            }, this));
            */
        }
        public void GoBackToHomeLobby()
        {
            Debug.Log("go back to home lobby");
            gameLobby.GetComponent<GameLobby>().switchGameLobby();
            StartCoroutine(SceneManagementManager.Instance.LoadLevel(SceneList.MAIN_MENU, (levelName) => { }));
        }
        public static void CallTurnOver(NetworkIdentity ni)
        {
            ni.SetIsMyTurn(false);
            ni.GetSocket().Emit("turnOver");
        }
    }

    [Serializable]
    public class Player
    {
        public string id;
        public Position position;
    }

    [Serializable]
    public class Position
    {
        public float x;
        public float y;
    }

    [Serializable]
    public class ReadyState
    {
        public bool state;
    }
}
