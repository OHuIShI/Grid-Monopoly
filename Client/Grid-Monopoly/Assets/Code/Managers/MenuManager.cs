using System;
using System.Collections;
using System.Collections.Generic;
using Project.Networking;
using Project.Utility;
using SocketIO;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Project.Managers
{
    public class MenuManager : MonoBehaviour
    {
        [SerializeField]
        private Button queueButton;
        public TMP_InputField inputName;
        public GameObject inputPanel;
        public GameObject welcomePanel;
        public GameObject joinPanel;
        public string username;

        private SocketIOComponent socketReference;

        public SocketIOComponent SocketReference
        {
            get
            {
                return socketReference = (socketReference == null) ? FindObjectOfType<NetworkClient>() : socketReference;
            }
        }

        public void Start()
        {
            welcomePanel.SetActive(false);
            joinPanel.SetActive(false);
            inputPanel.SetActive(false);

            queueButton.interactable = false;

            StartCoroutine(SceneManagementManager.Instance.LoadLevel(SceneList.ONLINE, (levelName) => {
                queueButton.interactable = true;
            }));
        }

        public void OnQueue()
        {
            Debug.Log("OnQueue");
            SocketReference.Emit("joinGame");
        }
        public void OnClickEnter()
        {
            username = inputName.text;
            UserInfo data = new UserInfo();
            data.username = username;
            SocketReference.Emit("setUserInfo", new JSONObject(JsonUtility.ToJson(data)));
        }
        public void setInputPanel(string msg)
        {
            welcomePanel.SetActive(false);
            inputPanel.SetActive(true);
            joinPanel.SetActive(false);
            inputPanel.transform.GetChild(1).GetComponent<TextMeshProUGUI>().text = msg;
        }
        public void setLobbyPanel()
        {
            welcomePanel.transform.GetChild(1).GetComponent<TextMeshProUGUI>().text = username;
            welcomePanel.SetActive(true);
            inputPanel.SetActive(false);
            joinPanel.SetActive(true);
        }
    }
    [Serializable]
    public class UserInfo
    {
        public string username;
    }
}