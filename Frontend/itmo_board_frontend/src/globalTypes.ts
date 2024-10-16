export type BoardTool = {
    name: string;
    icon_path: string;
    handler: () => void;
    width?: number;
    height?: number;
};
