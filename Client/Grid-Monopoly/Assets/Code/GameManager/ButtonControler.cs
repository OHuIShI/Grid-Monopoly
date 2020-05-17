using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ButtonControler : MonoBehaviour
{
    public Button YesButton;
    public Button NoButton;
    public bool clicked;
    public bool result;

    void Start()
    {
        YesButton.onClick.AddListener(ClickedYes);
        NoButton.onClick.AddListener(ClickedNo);
    }

    void ClickedYes()
    {
        clicked = true;
        result = true;
    }

    void ClickedNo()
    {
        clicked = true;
        result = false;
    }
}
