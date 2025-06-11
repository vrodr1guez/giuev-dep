import React from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const Card = styled.div`
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--shadow);
  transition: all var(--transition-normal);
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}20;
  color: ${props => props.color};
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const TrendBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const Title = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const Value = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
`;

const MetricCard = ({ icon, title, value, trend, color }) => {
  const isPositive = trend && trend.startsWith('+');
  const isStable = trend === 'Stable';

  return (
    <Card>
      <CardHeader>
        <IconWrapper color={color}>
          {icon}
        </IconWrapper>
        {trend && !isStable && (
          <TrendBadge positive={isPositive}>
            {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            {trend}
          </TrendBadge>
        )}
        {isStable && (
          <TrendBadge positive={true}>
            {trend}
          </TrendBadge>
        )}
      </CardHeader>
      <Title>{title}</Title>
      <Value>{value}</Value>
    </Card>
  );
};

export default MetricCard; 