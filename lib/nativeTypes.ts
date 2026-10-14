export type NativeRect={x:number;y:number;w:number;h:number};
export type NativeSpan={id:string;text:string;rect:NativeRect;baseline:number;size:number;font:'sans'|'serif';color:string};
export type NativeTextEdit=NativeSpan & {replacement:string};
export type NativeImageSpan={id:string;rect:NativeRect};
export type NativeImageEdit=NativeImageSpan & {objectId?:string};
