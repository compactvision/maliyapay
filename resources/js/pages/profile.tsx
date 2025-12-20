// resources/js/pages/Profile/ProfilePage.tsx
import { DeleteAccountSection } from '@/components/partials/DeleteAccountSection';
import { InfoSection } from '@/components/partials/InfoSection';
import { PasswordChangeForm } from '@/components/partials/PasswordChangeForm';
import { ProfileHeader } from '@/components/partials/ProfileHeader';
import { ProfileInfoForm } from '@/components/partials/ProfileInfoForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/layouts/AppLayout';

export default function ProfilePage() {
    const { user } = useAuth();

    return (
        <AppLayout>
            <div className="mx-auto max-w-6xl space-y-6 py-4 sm:p-6 lg:p-8">
                <ProfileHeader user={user} />

                <Tabs defaultValue="info" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-1 bg-slate-100 dark:bg-slate-800">
                        <TabsTrigger value="info">Informations</TabsTrigger>
                        <TabsTrigger value="profile">Profil</TabsTrigger>
                        <TabsTrigger value="danger">Zone à risque</TabsTrigger>
                    </TabsList>


                    <TabsContent value="info" className="space-y-6">
                        <InfoSection />
                    </TabsContent>

                    <TabsContent value="profile" className="space-y-6">
                        <ProfileInfoForm user={user} />
                    </TabsContent>

                    <TabsContent value="danger" className="space-y-6">
                        <DeleteAccountSection />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
