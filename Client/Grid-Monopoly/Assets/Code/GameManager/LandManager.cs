using Project.Networking;
using Project.Player;
using Project.Utility;
using Project.Utility.Attributes;
using SocketIO;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using static Project.BlockChain.BlockChainManager;
using TMPro;

namespace Project {
    [Serializable]
    public class Land
    {
        public int id;
        public string name;
        public string ownerID = "";
        public Price price;
        public Status status;
        public int totalValue;
        public GameObject land;
    }
    [Serializable]
    public class Price
    {
        public int land;
        public int building;
        public int contract;
    }
    [Serializable]
    public class Status
    {
        public bool land;
        public bool building;
        public bool contract;
    }
    public class LandManager : MonoBehaviour
    {
        public static Land[] lands;
        private GameObject groundObject;
        private GameObject[] grounds;

        public void Start()
        {
            groundObject = GameObject.FindGameObjectWithTag("Ground");
            grounds = new GameObject[groundObject.transform.childCount];
            //grounds = groundObject.GetComponentsInChildren<GameObject>();
            Debug.Log(groundObject.transform.childCount);
            for(int i=0; i<groundObject.transform.childCount; i++)
            {
                grounds[i] = groundObject.transform.GetChild(i).gameObject;
                grounds[i].transform.GetChild(2).gameObject.SetActive(false);
            }
            /*
            Debug.Log("^^^"+grounds.Length);
            grounds[2].transform.GetChild(1).gameObject.SetActive(false);
            Debug.Log("**************"+grounds[10].name);
            foreach (Transform g in groundObject.transform.GetComponentsInChildren<Transform>())
            {
                Debug.Log(g.name);
                grounds.Add(g.gameObject);
            }
            */
            Debug.Log("ground setting is done");
        }
        private Color initialColor = new Color(1.0f, 1.0f, 1.0f, 0f);

        public void resetLandSettings(string owner)
        {
            for (int i = 0; i < lands.Length; i++)
            {
                if (lands[i].ownerID == owner)
                {
                    lands[i].status.land = false;
                    lands[i].status.building = false;
                    lands[i].status.contract = false;
                    lands[i].totalValue = 0;
                    lands[i].ownerID = "";
                }
            }
        }

        public void initializeLandSettings()
        {
            Debug.Log("initialize Land Settings");
            
            Data initialData = GetLatestBlockData();
            Debug.Log(initialData);
            lands = JsonHelper.FromJson<Land>(initialData.eventData["initialGameData"].ToString());
            for (int i = 0; i < lands.Length; i++)
            {
                GameObject obj = gameObject.transform.GetChild(i).gameObject;
                lands[i].land = obj;
                lands[i].land.transform.Find("BuildingName").GetComponent<TMP_Text>().text = lands[i].name;
                lands[i].land.transform.Find("Cost").GetComponent<TMP_Text>().text = lands[i].price.land.ToString(); // 쥬인이 없으면 땅값 표시

                Transform[] ts = grounds[i].transform.GetChild(2).GetComponentsInChildren<Transform>(true);

                foreach(Transform t in ts)
                    if(t.gameObject.name == lands[i].name)
                    {
                        t.gameObject.SetActive(true);
                        break;
                    }
            }

            Debug.Log("done initializeLandSettings");
        }

        public void updateLandData(Data D)
        {
            Debug.Log("updateLandData");
            string state = D.eventData["state"].ToString().RemoveQuotes();
            Debug.Log("state = " + state);
            string id = D.eventData["id"].ToString().RemoveQuotes();
            int landIndex = Int32.Parse(D.eventData["landIndex"].ToString().RemoveQuotes());
			int totalValue = Int32.Parse(D.eventData["totalValue"].ToString().RemoveQuotes());
            int printValue = 0;
            string prevOwnerId = "";
            int prevOwnerAssets = 0;
            int ownerAssets = 0;
            Color color = initialColor;

            switch (state)
            {
                case "BuyLand":
                    Debug.Log("LandManager - updateLandData - BuyLand - [start]");
                    lands[landIndex].ownerID = id;
                    lands[landIndex].status.land = true;
                    printValue = (totalValue * 4);
                    color = NetworkClient.serverObjects[lands[landIndex].ownerID].GetComponent<PlayerManager>().getColor();

                    ownerAssets = Int32.Parse(D.eventData["ownerAssets"].ToString().RemoveQuotes());
                    NetworkClient.serverObjects[lands[landIndex].ownerID].GetComponent<PlayerManager>().setAssets(ownerAssets);

                    grounds[landIndex].transform.GetChild(1).gameObject.SetActive(false);
                    Debug.Log("LandManager - updateLandData - BuyLand - [done]");
                    break;
                case "Building":
                    lands[landIndex].status.building = true;
                    printValue = (totalValue * 4);
                    color = NetworkClient.serverObjects[lands[landIndex].ownerID].GetComponent<PlayerManager>().getColor();

                    ownerAssets = Int32.Parse(D.eventData["ownerAssets"].ToString().RemoveQuotes());
                    NetworkClient.serverObjects[lands[landIndex].ownerID].GetComponent<PlayerManager>().setAssets(ownerAssets);

                    grounds[landIndex].transform.GetChild(2).gameObject.SetActive(true);
                    break;
                case "Contract":
                    lands[landIndex].status.contract = true;
                    printValue = (totalValue * 4);
                    color = NetworkClient.serverObjects[lands[landIndex].ownerID].GetComponent<PlayerManager>().getColor();

                    ownerAssets = Int32.Parse(D.eventData["ownerAssets"].ToString().RemoveQuotes());
                    NetworkClient.serverObjects[lands[landIndex].ownerID].GetComponent<PlayerManager>().setAssets(ownerAssets);
                    break;
                case "Acquire":
                    lands[landIndex].ownerID = id;
                    printValue = (totalValue * 4);
                    color = NetworkClient.serverObjects[lands[landIndex].ownerID].GetComponent<PlayerManager>().getColor();
                    ownerAssets = Int32.Parse(D.eventData["ownerAssets"].ToString().RemoveQuotes());
                    NetworkClient.serverObjects[lands[landIndex].ownerID].GetComponent<PlayerManager>().setAssets(ownerAssets);
                    prevOwnerId = D.eventData["prevOwnerId"].ToString().RemoveQuotes();
                    prevOwnerAssets = Int32.Parse(D.eventData["prevOwnerAssets"].ToString().RemoveQuotes());
                    NetworkClient.serverObjects[prevOwnerId].GetComponent<PlayerManager>().setAssets(prevOwnerAssets);
                    break;
                case "Sell":
                    Debug.Log("LandManager - updateLandData - sell - [start]");
                    lands[landIndex].ownerID = id;
                    lands[landIndex].status.land = false;
                    lands[landIndex].status.building = false;
                    lands[landIndex].status.contract = false;
                    printValue = lands[landIndex].price.land;
                    color = initialColor;
                    prevOwnerId = D.eventData["prevOwnerId"].ToString().RemoveQuotes();
                    prevOwnerAssets = Int32.Parse(D.eventData["prevOwnerAssets"].ToString().RemoveQuotes());
                    NetworkClient.serverObjects[prevOwnerId].GetComponent<PlayerManager>().setAssets(prevOwnerAssets);

                    grounds[landIndex].transform.GetChild(1).gameObject.SetActive(true);
                    grounds[landIndex].transform.GetChild(2).gameObject.SetActive(false);
                    Debug.Log("LandManager - updateLandData - sell - [done]");
                    break;
            }

            lands[landIndex].totalValue = totalValue;
            lands[landIndex].land.GetComponent<MeshRenderer>().material.color = color;
            lands[landIndex].land.transform.Find("Cost").GetComponent<TextMesh>().text = printValue.ToString(); // 주인이 생기면 바닥에 통행료 표시
            Debug.Log("done updateLandData");
        }
    }

}
