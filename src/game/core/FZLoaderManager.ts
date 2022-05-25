import Handler = Laya.Handler;

namespace game.core
{
    export class FZLoaderManager
    {
        /**
         * 从服务器加载资源的地址前缀
         */
        public static DownloadUrlPrefix: string;

        /**
         * 是否强制使用本地资源
         */
        public static ForceLocalRes: boolean;

        /**
         * 通过 Laya 资源加载管理器加载资源
         * 原型为 Laya.loader.load
         * @param	url			要加载的单个资源地址或资源信息数组。
         * @param   isLocal     是否为本地资源(非本地资源自动添加FZLoaderManager.DownloadUrl作为地址前缀)
         * @param	complete	加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
         * @param	progress	加载进度回调。回调参数值为当前资源的加载进度信息(0-1)。
         * @param	type		资源类型。比如：Loader.IMAGE。
         * @param	priority	(default = 1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
         * @param	cache		是否缓存加载结果。
         * @param	group		分组，方便对资源进行管理。
         * @param	ignoreCache	是否忽略缓存，强制重新加载。
         * @param	useWorkerLoader(default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
         */
        public static loadRes(url: any, isLocal: boolean, complete?: Handler, progress?: Handler, type?: string, priority?: number, cache?: boolean, group?: string, ignoreCache?: boolean, useWorkerLoader?: boolean)
        {
            let prefix = isLocal ? '' : this.DownloadUrlPrefix;
            prefix = this.ForceLocalRes ? '' : prefix;
            Laya.loader.load(prefix + url, complete, progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
        }

        /**
         * 通过 Laya 资源加载管理器获取指定资源地址的资源
         * 原型为 Laya.loader.getRes
         * @param url 要获取来使用的资源地址
         * @param isLocal 是否为本地资源(非本地资源自动添加FZLoaderManager.DownloadUrl作为地址前缀)
         */
        public static getRes(url: any, isLocal: boolean): any
        {
            let prefix = isLocal ? '' : this.DownloadUrlPrefix;
            prefix = this.ForceLocalRes ? '' : prefix;
            Laya.loader.getRes(prefix + url);
        }

        /**
         * Texture2D地址
         * @param url Texture2D地址
         * @param isLocal 是否为本地资源(非本地资源自动添加FZLoaderManager.DownloadUrl作为地址前缀)
         * @param complete 加载完成的回调函数
         */
        public static loadTexture2D(url: string, isLocal: boolean, complete: Handler): void
        {
            let prefix = isLocal ? '' : this.DownloadUrlPrefix;
            prefix = this.ForceLocalRes ? '' : prefix;
            Laya.Texture2D.load(prefix + url, complete);
        }

        /**
         * ***不需要添加.fnt后缀名***   
         * 通过指定位图字体文件路径，加载位图字体文件，加载完成后会自动解析     
         * @param bitmapFont 位图字体的实例对象
         * @param url 位图字体文件的路径
         * @param isLocal 是否为本地资源(非本地资源自动添加FZLoaderManager.DownloadUrl作为地址前缀)
         * @param complete 加载完成的回调函数
         */
        public static loadFont(bitmapFont: Laya.BitmapFont, url: string, isLocal: boolean, complete: Handler)
        {
            let prefix = isLocal ? '' : this.DownloadUrlPrefix;
            prefix = this.ForceLocalRes ? '' : prefix;
            bitmapFont.loadFont(prefix + url + ".fnt", complete);
        }
    }
}

export default game.core.FZLoaderManager