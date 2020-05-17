using Project.Networking;
using Project.Utility;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace Project.Player
{
    public class PlayerManager : MonoBehaviour
    {
        [Header("Data")]
        [SerializeField]
        private int assets;
        [SerializeField]
        private int balance;

        private string userState;
        private string userName;

        private Color userColor;
        private GameObject userInfo;

        [Header("Class References")]
        [SerializeField]
        private NetworkIdentity networkIdentity;

        private Animator anim;

        public void Update()
        {
            /*if (networkIdentity.IsControlling())
            {

            }*/
        }
        public void setColor(Color color)
        {
            this.userColor = color;
        }
        public Color getColor()
        {
            return this.userColor;
        }

        public void setUserInfo(GameObject userInfo, string name)
        {
            userState = "";
            this.userInfo = userInfo;
            this.userName = name;
            this.userInfo.transform.GetChild(0).GetComponent<Text>().text = name;
            this.userInfo.GetComponent<Image>().color = this.getColor();
            this.userInfo.SetActive(true);
        }
        public GameObject getUserInfo()
        {
            return this.userInfo;
        }
        public string getUsername()
        {
            return this.userName;
        }
        public int getAssets()
        {
            return this.assets;
        }
        public int getBalance()
        {
            return this.balance;
        }
        public void setAssets(int a)
        {
            this.assets = a;
            userInfo.transform.Find("Assets").GetComponent<Text>().text = a.ToString();
        }
        public void setBalance(int a)
        {
            this.balance = a;
            userInfo.transform.Find("Balance").GetComponent<Text>().text = a.ToString();
        }
        public int Withdraw(int a)
        {
            if (a <= this.balance)
            {
                this.setBalance(this.balance - a);
                return this.balance;
            }
            else
            {
                Debug.Log("ERROR: lack of balance");
                return this.balance;
            }
        }
        public void Deposit(int a)
        {
            this.setBalance(this.balance + a);
        }
        public void SetUserState(string state)
        {
            userState = state;
            userInfo.transform.Find("Text").GetComponent<Text>().text = state;
            userInfo.transform.Find("Text").GetComponent<Text>().gameObject.SetActive(true);
        }

        public void setAnimator(Animator _anim)
        {
            this.anim = _anim;
        }

        public Animator getAnimator()
        {
            return this.anim;
        }
    }
}