import ProfileHeader from '@/components/shared/ProfileHeader';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

async function Page({ params }: { params: { id: string }}) {
    const user = await currentUser();

    if(!user) return null;

    const userInfo = await fetchUser(params.id);

    if (!userInfo?.onboarded) redirect('/onboarding'); // move all the users that maybe switch their url bar manually, it will bring them back to onboarding

    return (
        <section>
            <ProfileHeader 
                accountId={userInfo.id}
                authUserId={user.id}
                name={userInfo.name}
                username={userInfo.username}
                imgUrl={userInfo.image}
                bio={userInfo.bio}
            />

            <div className="mt-9">
                <Tabs defaultValue="threads" className="w-full">
                    <TabsList className="tab">

                    </TabsList>
                </Tabs>
            </div>
        </section>
    )
}

export default Page;