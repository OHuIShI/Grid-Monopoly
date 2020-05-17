using System.Collections;
using System.Collections.Generic;
using Project.Networking;
using SocketIO;
using UnityEngine;
using TMPro;
using System;
using Project.Utility;
using UnityEngine.UI;

namespace Project.UserInterface
{
    public class GameLobby : MonoBehaviour
    {
        [SerializeField]
        private GameObject gameLobbyContainer;
        public GameObject playersPanel;
        public GameObject readyButton;
        public GameObject readyDoneButton;
        public GameObject exitButton;
        [SerializeField]
        private bool ready;
        [SerializeField]
        private bool [] lobbyStates = new bool[4];
        public NetworkIdentity ni;
        //private ColorBlock clickedCB;
        //private ColorBlock nonClickedCB;
        public void Start()
        {
            NetworkClient.OnGameStateChange += OnGameStateChange;
            ready = false;
            //Initial Turn off screens
            gameLobbyContainer.SetActive(false);

/*            nonClickedCB = readyButton.GetComponent<Button>().colors;
            clickedCB =  ColorBlock.defaultColorBlock;
            clickedCB.normalColor = new Color32(170, 217, 255, 255);
            clickedCB.highlightedColor = new Color32(170, 217, 255, 255);
            clickedCB.pressedColor = new Color32(112, 185, 255, 255);*/
        }
        public void setPlayerState(int index, bool state)
        {
            lobbyStates[index] = state;
        }
        
        public void switchGameLobby()
        {
            gameLobbyContainer.SetActive(!gameLobbyContainer.activeSelf);
        }

        private void OnGameStateChange(SocketIOEvent e)
        {
            string state = e.data["state"].str;
            Debug.Log(state);
            switch (state)
            {
                case "Game":
                    gameLobbyContainer.SetActive(false);
                    break;
                case "EndGame":
                    gameLobbyContainer.SetActive(false);
                    break;
                case "GameLobby":
                    gameLobbyContainer.SetActive(true);
                    break;
                case "Lobby":
                    gameLobbyContainer.SetActive(false);
                    break;
                default:
                    gameLobbyContainer.SetActive(false);
                    break;
            }
        }
        public void OnEnterPlayer(int index, string id, string name)
        {
            //readyButton.SetActive(true);
            lobbyStates[index] = false;
            GameObject player = playersPanel.transform.GetChild(index).gameObject;
            player.SetActive(true);
            player.transform.GetChild(1).GetComponent<TextMeshProUGUI>().text = name;
        }
        public bool OnSwitchReadyState()
        {
            ready = !ready;
            if (ready)
            {
                readyButton.SetActive(false);
                readyDoneButton.SetActive(true);
            }
            else
            {
                readyButton.SetActive(true);
                readyDoneButton.SetActive(false);
            }
            return ready;
        }
    }
}