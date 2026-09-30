/**
 * @iconify/icons-mdi 的深路径导入兜底类型声明。
 * 图标包每个图标都自带 .d.ts，这里只兜住个别版本缺失的场景。
 * 刻意不依赖 @iconify/types（它不是直接依赖），用结构等价的本地类型。
 */
declare module "@iconify/icons-mdi/*" {
  const icon: {
    body: string;
    width?: number;
    height?: number;
    left?: number;
    top?: number;
    rotate?: number;
    hFlip?: boolean;
    vFlip?: boolean;
    hidden?: boolean;
  };
  export default icon;
}
