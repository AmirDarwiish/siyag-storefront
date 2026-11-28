import {CustomFragrance} from '@/components/fragrance-journeys';
import {storeMetadata} from '@/lib/metadata';
export const metadata=storeMetadata('Your personal fragrance request','Tell SIYAG the fragrance you would love to try.','/custom-fragrance');
export default function Page(){return <CustomFragrance/>}
