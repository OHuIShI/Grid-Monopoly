using System.Collections;
using System.Collections.Generic;
using Project.Networking;
using UnityEngine;

namespace Project.Managers
{
    public class CameraManager : MonoBehaviour
    {
        public Camera mainCam;
        public Camera underCam;
        public GameObject LevelCanvas;
        private bool camStat; // 0 : main, 1 : under
        private float speed = 1f;
        private float mouseX, mouseY;
        // Start is called before the first frame update
        void Start()
        {
            //LevelCanvas = GameObject.FindGameObjectWithTag("LevelCanvas");
            mainCam = GameObject.FindGameObjectWithTag("MainCamera").GetComponent<Camera>();
            camStat = false;
        }

        // Update is called once per frame
        void Update()
        {
            //error
            if (NetworkClient.serverObjects[NetworkClient.ClientID].IsMyTurn())
            {
                underCam.enabled = false;
                mainCam.enabled = true;
                camStat = false;
                LevelCanvas.SetActive(true);
            }
            else if(!camStat)
            {
                CamControl();
            }
        }

        public void switchCamera()
        {
            if (camStat)
            {
                if(NetworkClient.serverObjects[NetworkClient.ClientID].IsMyTurn() == false)
                {
                    underCam.enabled = true;
                    mainCam.enabled = false;
                    LevelCanvas.SetActive(false);
                }
            }
            else
            {
                underCam.enabled = false;
                mainCam.enabled = true;
                LevelCanvas.SetActive(true);
            }
            camStat = !camStat;
        }

        void CamControl()
        {
            Vector3 currentPosition = this.underCam.transform.position;
            if (Input.GetKey(KeyCode.LeftShift))
            {
                mouseX += Input.GetAxis("Mouse X") * speed;
                mouseY -= Input.GetAxis("Mouse Y") * speed;
                mouseY = Mathf.Clamp(mouseY, -35, 60);

                this.underCam.transform.rotation = Quaternion.Euler(mouseY, mouseX, 0);
            }

            if (Input.GetKey(KeyCode.W))
            {
                this.underCam.transform.Translate(Vector3.forward * speed * Time.deltaTime);
                /*
                if (this.underCam.transform.position.z < 2.5f)
                    this.underCam.transform.Translate(Vector3.forward * speed * Time.deltaTime);
                else
                    this.underCam.transform.position = new Vector3(this.underCam.transform.position.x, this.underCam.transform.position.y, 2.5f);
                */
            }
            if (Input.GetKey(KeyCode.S))
            {
                this.underCam.transform.Translate(Vector3.back * speed * Time.deltaTime);
                /*
                if (this.underCam.transform.position.x > -2.5f)
                    this.underCam.transform.Translate(Vector3.back * speed * Time.deltaTime);
                else
                    this.underCam.transform.position = new Vector3(this.underCam.transform.position.x, this.underCam.transform.position.y, -2.5f);
                */
            }
            if (Input.GetKey(KeyCode.A))
            {
                this.underCam.transform.Translate(Vector3.left * speed * Time.deltaTime);
                /*
                if (this.underCam.transform.position.x < 2.5f)
                    this.underCam.transform.Translate(Vector3.left * speed * Time.deltaTime);
                else
                    this.underCam.transform.position = new Vector3(2.5f, this.underCam.transform.position.y, this.underCam.transform.position.z);
                */
            }
            if (Input.GetKey(KeyCode.D))
            {
                this.underCam.transform.Translate(Vector3.right * speed * Time.deltaTime);
                /*
                if (this.underCam.transform.position.x > -2.5f)
                    this.underCam.transform.Translate(Vector3.right * speed * Time.deltaTime);
                else
                    this.underCam.transform.position = new Vector3(-2.5f, this.underCam.transform.position.y, this.underCam.transform.position.z);
                */
            }
            this.underCam.transform.position = new Vector3(Mathf.Clamp(this.underCam.transform.position.x, -2.5f, 2.5f), Mathf.Clamp(this.underCam.transform.position.y,-1.5f,-1.0f), Mathf.Clamp(this.underCam.transform.position.z, -2.5f, 2.5f));
        }
    }
}