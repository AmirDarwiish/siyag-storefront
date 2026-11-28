import {ScentFinder} from '@/components/fragrance-journeys';
import {publishedProducts} from '@/lib/published-catalog';
import {pendingCatalog} from '@/lib/home-catalog';
import {storeMetadata} from '@/lib/metadata';
export const metadata=storeMetadata('Find your scent','Discover SIYAG fragrances through your mood, occasion and favourite notes.','/find-your-scent','/brand/journeys/mood-banner.webp');
export default function Page(){return <ScentFinder initialProducts={pendingCatalog(publishedProducts)}/>}
