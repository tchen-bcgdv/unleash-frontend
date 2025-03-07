import React from 'react';
import { FeatureEventHistory } from 'component/history/FeatureEventHistory/FeatureEventHistory';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

export const FeatureEventHistoryPage = () => {
    const toggleName = useRequiredPathParam('toggleName');

    return <FeatureEventHistory featureId={toggleName} />;
};
