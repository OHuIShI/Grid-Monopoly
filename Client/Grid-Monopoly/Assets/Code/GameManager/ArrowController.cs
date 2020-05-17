using Project.Networking;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ArrowController : MonoBehaviour
{
    public int dir = -1;

    void OnMouseDown ()
    {
        if(NetworkClient.serverObjects[NetworkClient.ClientID].IsMyTurn())
        {
            GameObject arrowManager = GameObject.FindGameObjectWithTag("ArrowManager");
            arrowManager.GetComponent<ArrowManager>().ClickedArrow(dir);
        }
    }
}
