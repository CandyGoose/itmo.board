import { CreateOrganization } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';

export const EmptyOrg = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mt-6">
                Welcome to itmo.board
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
                Create an organization to get started!
            </p>

            <div className="mt-6 ">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg">Create an Organization!</Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 bg-transparent border-none max-w-[480px]">
                        <CreateOrganization />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};