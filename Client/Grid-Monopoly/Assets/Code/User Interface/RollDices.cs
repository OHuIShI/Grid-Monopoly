using Project.Networking;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class RollDices : MonoBehaviour
{
    public GameObject RollButton;
    private NetworkIdentity ni;
    public Image RollButton_Timer;

    bool timer = false;
    float _time = 0f;
    float waitTime = 5f;
    bool clicked = false;
  
    // Start is called before the first frame update
    void Start()
    {
        RollButton.SetActive(false);
    }

    // Update is called once per frame
    void Update()
    {
        if(timer)
        {
            if(_time < waitTime)
            {
                _time += Time.deltaTime;
                RollButton_Timer.fillAmount = (waitTime - _time) / waitTime;
            }
            else
            {
                clicked = true;
            }

            if(clicked)
            {
                timer = false;
                clicked = false;
                _time = 0;
                ni.GetSocket().Emit("rollDices");
                RollButton.SetActive(false);
            }
        }
    }

    public void StartRoll()
    {
        RollButton.SetActive(true);
        ni = NetworkClient.serverObjects[NetworkClient.ClientID];
        RollButton_Timer.color = ni.GetPlayerManager().getColor();
        timer = true;
    }

    public void OnClickRoll()
    {
        //if (networkIdentity.IsControlling())
        {
            Debug.Log("OnClickRoll");
            clicked = true;
        }
    }
}
