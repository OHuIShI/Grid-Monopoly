using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Project {
public class TestCameraManager : MonoBehaviour
{
        private float speed = 5f;
        private float mouseX, mouseY;
        public Camera underCam;
        // Start is called before the first frame update
        public void Start()
        {
        
        }

        // Update is called once per frame
        public void Update()
        {
            CamControl();
        }

        void CamControl()
        {
            if(Input.GetKey(KeyCode.LeftShift))
            {
                mouseX += Input.GetAxis("Mouse X") * speed;
                mouseY -= Input.GetAxis("Mouse Y") * speed;
                mouseY = Mathf.Clamp(mouseY, -35, 60);

                this.underCam.transform.rotation = Quaternion.Euler(mouseY, mouseX, 0);
            }
            
            if(Input.GetKey(KeyCode.W))
            {
                this.underCam.transform.Translate(Vector3.forward * speed * Time.deltaTime);
            }
            if(Input.GetKey(KeyCode.S))
            {
                this.underCam.transform.Translate(Vector3.back * speed * Time.deltaTime);
            }
            if(Input.GetKey(KeyCode.A))
            {
                this.underCam.transform.Translate(Vector3.left * speed * Time.deltaTime);
            }
            if(Input.GetKey(KeyCode.D))
            {
                this.underCam.transform.Translate(Vector3.right * speed * Time.deltaTime);
            }
        }
    }
}
