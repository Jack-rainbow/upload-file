// 规定message 格式
export declare class MessageParam {
    public type: string;
    public message: string;
}

export declare type Message = (messageParam: MessageParam) => void;

declare module '@femessage/element-ui';
declare module '@femessage/element-ui/lib/transitions/collapse-transition';
