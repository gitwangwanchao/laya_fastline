import QDebug from "../../framework/QDebug";

/**
 * 存储
 */
namespace game.data
{
	export class QSavedDateItem
	{
		private static _instance : QSavedDateItem;
        public static get instance() : QSavedDateItem
        {
            if(this._instance == null)
            {
                this._instance = new QSavedDateItem();
            }
            return this._instance;
		}
		/**
		 * 字符串存储
		 */
		public setItemToLocalStorage(key: string, value: string): void{
			try{
				Laya.LocalStorage.setItem(key, value);
			} catch(e) {
				QDebug.E("string setItemToLocalStorage fail");
			}
		}
		/**
		 * 字符串获取
		 */
		public getItemFromLocalStorage(key: string , defaultValue: string): string 
		{
			var tmp =Laya.LocalStorage.getItem(key);
			if (!tmp) {
				return defaultValue;
			}
			return tmp;
		}
		
		/**
		 * JSON存储
		 */
		public setJSONToLocalStorage(key: string, value: any): void
		{
			try{
				Laya.LocalStorage.setJSON(key, value);
			} catch(e) {
				QDebug.E("JSON setItemToLocalStorage fail");
			}
		}
		
		/**
		 * JSON获取
		 * @param key 
		 */
		public getJSONFromLocalStorage(key: string, defaultValue:any): any {
			var tmp = Laya.LocalStorage.getItem(key);
			if (!tmp) {
				return defaultValue;
			}
			return tmp;

		}

		/**
		 * 删除 字符串存储
		 * @param key 
		 */
		public removeItem(key: string): void 
		{
			Laya.LocalStorage.removeItem(key);
		}

		/**
		 * 清空本地数据
		 */
		public static clear(): void 
		{
			Laya.LocalStorage.clear();
		}
	}
}

export default game.data.QSavedDateItem;

