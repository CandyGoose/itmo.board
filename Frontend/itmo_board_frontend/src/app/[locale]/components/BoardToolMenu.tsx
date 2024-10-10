// import {useTranslations} from "next-intl";
import {BoardToolButton} from "@/app/[locale]/components/buttons/BoardToolButton";
import {BoardTool} from "@/globalTypes";

const tools: BoardTool[] = [
    {
        "name": "cursor",
        "icon_path": "",
        "handler": () => {return}
    },
    {
        "name": "pencil",
        "icon_path": "",
        "handler": () => {return}
    },
    {
        "name": "eraser",
        "icon_path": "",
        "handler": () => {return}
    },
    {
        "name": "figure",
        "icon_path": "",
        "handler": () => {return}
    },
    {
        "name": "text",
        "icon_path": "",
        "handler": () => {return}
    },
    {
        "name": "image",
        "icon_path": "",
        "handler": () => {return}
    },
]

export const BoardToolMenu = () => {
    // const t = useTranslations('BoardTools');

    return (
        <div>
            {
                tools.map(
                    (tool: BoardTool) => (
                        <BoardToolButton key={tool.icon_path}
                                         name={tool.name}
                                         icon_path={tool.icon_path}
                                         handler={tool.handler}
                        />
                    )
                )
            }
        </div>
    );
};
