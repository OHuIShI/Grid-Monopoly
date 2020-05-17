using Project.Networking;
using Project.Utility;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using static Project.BlockChain.BlockChainManager;

public class ScoreBoardManager : MonoBehaviour
{
    public Transform entryContainer;
    public Transform entryTemplate;
    public Button backToGameLobby;
    public GameObject networkClient;

    void Start()
    {
        networkClient = GameObject.FindGameObjectWithTag("CodeNetworking");
        backToGameLobby.onClick.AddListener(networkClient.GetComponent<NetworkClient>().GoBackToGameLobby);
    }
    public void SetScoreBoard(string[] ranking)
    {
        Debug.Log("SetScoreBoard");

        entryTemplate.gameObject.SetActive(false);

        float templateHeight = 100f;

        for (int i = 0; i < ranking.Length; i++)
        {
            Transform entryTransform = Instantiate(entryTemplate, entryContainer);
            RectTransform entryRectTransform = entryTransform.GetComponent<RectTransform>();
            entryRectTransform.anchoredPosition = new Vector2(0, -templateHeight * i);
            entryTransform.gameObject.SetActive(true);

            int pos = i + 1;
            entryTransform.Find("posText").GetComponent<Text>().text = pos.ToString();
            entryTransform.Find("nameText").GetComponent<Text>().text = NetworkClient.serverObjects[ranking[i]].GetPlayerManager().getUsername();
            entryTransform.Find("scoreText").GetComponent<Text>().text = NetworkClient.serverObjects[ranking[i]].GetPlayerManager().getAssets().ToString();
        }
        Debug.Log("done SetScoreBoard");
    }
}
