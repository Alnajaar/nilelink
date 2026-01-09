import { Metadata } from 'next';
import { SiteMap } from '../../../../shared/components/SiteMap';

export const metadata: Metadata = {
    title: 'Site Map | NileLink',
    description: 'Navigate through all pages and sections of NileLink platform',
};

export default function SiteMapPage() {
    return <SiteMap />;
}