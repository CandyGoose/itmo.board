import {useTranslations} from "next-intl";
import Link from "next/link";

// TODO get user's data
const recentBoards: { name: string, link: string }[] = [
    {
        "name": "МатАнализ лек 1",
        "link": ""
    },
    {
        "name": "МатАнализ прак 1",
        "link": ""
    }
]

export const BoardChooser = () => {
    const t = useTranslations('BoardChooser');

    return (
       <div>
           {t("create_a_board")}

           <form>
               <input placeholder={t("enter_board_name")}/>
               <button type={"submit"}>{t("create")}</button>
           </form>

           {t("recent_boards")}

           {
               recentBoards.map(
                   (board: { name: string, link: string }) => (
                       <Link key={board.link} href={board.link}>
                           {board.name}
                       </Link>
                   )
               )
           }
       </div>
    );
};
