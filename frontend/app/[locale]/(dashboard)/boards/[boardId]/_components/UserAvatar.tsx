import { Hint } from '@/components/Hint';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';

interface UserAvatarProps {
    src?: string;
    name?: string;
    fallback?: string;
    borderColor?: string;
    style?: React.CSSProperties;
}

export const UserAvatar = ({
    src,
    name,
    fallback,
    borderColor,
    style,
}: UserAvatarProps) => {
    return (
        <Hint label={name || 'Teammate'} side="bottom" sideOffset={18}>
            <Avatar
                className="h-8 w-8 border-2"
                style={{ borderColor: borderColor, ...style }} // Передаем стили
            >
                <AvatarImage src={src} />
                <AvatarFallback className="text-xs font-semibold">
                    {fallback}
                </AvatarFallback>
            </Avatar>
        </Hint>
    );
};
