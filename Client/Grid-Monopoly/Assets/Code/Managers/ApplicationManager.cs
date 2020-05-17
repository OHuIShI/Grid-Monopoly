using Project.Utility;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Project.Managers {
public class ApplicationManager : MonoBehaviour
{
        public void Start()
        {
            // 나중에 이렇게 호출하는 첫 화면을 Main Menu가 아니라 전체 로비로 해야 할 듯
            StartCoroutine(SceneManagementManager.Instance.LoadLevel(SceneList.MAIN_MENU, (levelName) => { }));
        }
    }
}
