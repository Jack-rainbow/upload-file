import OSS from 'ali-oss';


export function client(data: any) {// data后端提供数据
    return new OSS({
        region: data.region,
        accessKeyId: data.accessKeyId,
        accessKeySecret: data.accessKeySecret,
        bucket: data.bucket,
    })
}

/**
 * 生成随机文件名称
 * 规则八位随机字符，加下划线连接时间戳
 */
export const getFileNameUUID = (): string => {
    function rx() {
        // @ts-ignore
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return `${+new Date()}_${rx()}${rx()}`
} 
