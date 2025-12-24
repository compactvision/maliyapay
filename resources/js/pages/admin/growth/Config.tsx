import { usePage } from '@inertiajs/react';
import AdviceConfig from './AdviceConfig';
import BusinessConfig from './BusinessConfig';
import KitConfig from './KitConfig';

interface PageProps {
    item?: any;
    type?: 'advice' | 'kit' | 'business';
    [key: string]: any;
}

const AdminGrowthConfig = () => {
    const { props } = usePage<PageProps>();

    // Parse item if it's a string (sent via router.visit from Index.tsx)
    const item =
        typeof props.item === 'string' ? JSON.parse(props.item) : props.item;

    switch (props.type) {
        case 'advice':
            return <AdviceConfig item={item} />;
        case 'kit':
            return <KitConfig item={item} />;
        case 'business':
            return <BusinessConfig item={item} />;
        default:
            return (
                <div className="flex h-screen items-center justify-center">
                    <p className="text-xl font-semibold text-red-500">
                        Type de configuration inconnu : {props.type}
                    </p>
                </div>
            );
    }
};

export default AdminGrowthConfig;
