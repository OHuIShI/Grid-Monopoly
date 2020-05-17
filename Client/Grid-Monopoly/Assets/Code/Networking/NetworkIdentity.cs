using Project.Player;
using Project.Utility.Attributes;
using SocketIO;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Project.Networking
{
    public class NetworkIdentity : MonoBehaviour
    {
        [SerializeField]
        private PlayerManager playerManager;
        [Header("Helpful Values")]
        [SerializeField]
        [GreyOut]
        private string id;
        [SerializeField]
        [GreyOut]
        private bool isControlling;
        private bool isMyTurn;

        private SocketIOComponent socket;

        public void Awake()
        {
            //isControlling = false;
            isMyTurn = false;
        }
        public PlayerManager GetPlayerManager()
        {
            return playerManager;
        }
        public void SetControllerID(string ID)
        {
            id = ID;
            isControlling = (NetworkClient.ClientID == ID) ? true : false; //Check incoming id versuses the one we have saved from the server
        }

        public void SetSocketReference(SocketIOComponent Socket)
        {
            socket = Socket;
        }

        public string GetID()
        {
            return id;
        }

        public bool IsControlling()
        {
            return isControlling;
        }

        public SocketIOComponent GetSocket()
        {
            return socket;
        }

        public bool IsMyTurn()
        {
            return isMyTurn;
        }

        public void SetIsMyTurn(bool input)
        {
            isMyTurn = input;
        }

        public void checkIsMyTurn(string ID)
        {
            isMyTurn = (NetworkClient.ClientID == ID) ? true : false; //Check incoming id versuses the one we have saved from the server
        }
    }
}