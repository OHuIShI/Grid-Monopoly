using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Project.Utility.Attributes
{
    public static class JsonHelper
    {
        public static T[] FromJson<T>(string json)
        {
            Debug.Log("fron JSON");
            Wrapper<T> wrapper = JsonUtility.FromJson<Wrapper<T>>(json);
            Debug.Log("end fromJSON");
            return wrapper.landData;
        }
        
    public static string ToJson<T>(T[] array)
        {
            Wrapper<T> wrapper = new Wrapper<T>();
            wrapper.landData = array;
            return JsonUtility.ToJson(wrapper);
        }
    
    public static string ToJson<T>(T[] array, bool prettyPrint)
        {
            Wrapper<T> wrapper = new Wrapper<T>();
            wrapper.landData = array;
            return JsonUtility.ToJson(wrapper, prettyPrint);
        }

      
    [Serializable]
        private class Wrapper<T>
        {
            public T[] landData;
        }
    }


}

