
import OSS from 'ali-oss';



export function client() {
    return new OSS({
      region: process.env.VUE_APP_region,
      accessKeyId: process.env.VUE_APP_accessKeyId,
      accessKeySecret: process.env.VUE_APP_accessKeySecret,
      bucket: process.env.VUE_APP_bucket,
    });
}

/**
 * 生成随机文件名称
 * 规则八位随机字符，加下划线连接时间戳
 */
export const getFileNameUUID = (): string => {
    function rx() {
        // @ts-ignore
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return `${+new Date()}_${rx()}${rx()}`;
};
