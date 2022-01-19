import React, { useState } from 'react';
import HTMLReactParser from 'html-react-parser';
import { useParams } from 'react-router-dom';
import millify from 'millify';
import { Col, Row, Typography, Select, Collapse, Avatar, Statistic } from 'antd';
import { MoneyCollectOutlined, DollarCircleOutlined, FundOutlined, ExclamationCircleOutlined, StopOutlined, TrophyOutlined, CheckOutlined, NumberOutlined, ThunderboltOutlined } from '@ant-design/icons';

import { useGetCryptoDetailsQuery, useGetCryptoHistoryQuery, useGetCryptoExchangesQuery } from '../services/cryptoApi';
import { Loader, LineChart } from '.';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const CryptoDetails = () => {
    const { coinId } = useParams();
    const [timeperiod, setTimeperiod] = useState('7d');
    const { data, isFetching } = useGetCryptoDetailsQuery(coinId);
    const { data: exchangeData, isFetching: isFetchingExchangeData } = useGetCryptoExchangesQuery({ coinId, limit: 10 });
    const exchangesList = exchangeData?.data?.exchanges;
    const { data: coinHistory } = useGetCryptoHistoryQuery({ coinId, timeperiod });
    const cryptoDetails = data?.data?.coin;
    if (isFetching || isFetchingExchangeData) {
        return <Loader />;
    }
    const time = ['3h', '24h', '7d', '30d', '1y', '3m', '3y', '5y'];
    const stats = [
        { title: 'Price to USD', value: `$ ${cryptoDetails?.price && millify(cryptoDetails?.price)}`, icon: <DollarCircleOutlined /> },
        { title: 'Rank', value: cryptoDetails?.rank, icon: <NumberOutlined /> },
        { title: '24h Volume', value: `$ ${cryptoDetails?.['24hVolume'] && millify(cryptoDetails?.['24hVolume'])}`, icon: <ThunderboltOutlined /> },
        { title: 'Market Cap', value: `$ ${cryptoDetails?.marketCap && millify(cryptoDetails?.marketCap)}`, icon: <DollarCircleOutlined /> },
        { title: 'All-time-high(daily avg.)', value: `$ ${cryptoDetails?.allTimeHigh?.price && millify(cryptoDetails?.allTimeHigh?.price)}`, icon: <TrophyOutlined /> },
    ];
    const genericStats = [
        { title: 'Number Of Markets', value: cryptoDetails?.numberOfMarkets, icon: <FundOutlined /> },
        { title: 'Number Of Exchanges', value: cryptoDetails?.numberOfExchanges, icon: <MoneyCollectOutlined /> },
        { title: 'Approved Supply', value: cryptoDetails?.supply?.confirmed ? <CheckOutlined /> : <StopOutlined />, icon: <ExclamationCircleOutlined /> },
        { title: 'Total Supply', value: `$ ${cryptoDetails?.supply?.total && millify(cryptoDetails?.supply?.total)}`, icon: <ExclamationCircleOutlined /> },
        { title: 'Circulating Supply', value: `$ ${cryptoDetails?.supply?.circulating && millify(cryptoDetails?.supply?.circulating)}`, icon: <ExclamationCircleOutlined /> },
    ];
    return (
        <Col className='coin-detail-container'>
            <Col className='coin-heading-container'>
                <Title level={2} className='coin-name'>
                    {cryptoDetails.name} ({cryptoDetails.symbol}) Price
                </Title>
                <p>
                    {cryptoDetails.name} live price in US dollars.
                    View value statistics, market cap and supply.
                </p>
            </Col>
            <Select
                defaultValue={'7d'}
                className='select-timeperiod'
                placeholder='Select Time Period'
                onChange={(value) => setTimeperiod(value)}
            >
                {time?.map((date) => <Option key={date} value={date}>{date}</Option>)}
            </Select>
            <LineChart coinHistory={coinHistory} currentPrice={millify(cryptoDetails.price)} coinName={cryptoDetails.name} />
            <Col className='stats-container'>
                <Col className='coin-value-statistics'>
                    <Col className='coin-value-statistics-heading'>
                        <Title level={3} className='coin-details-heading'>
                            {cryptoDetails.name} Value Statistics
                        </Title>
                        <p>
                            An overview showing the stats of {cryptoDetails.name}
                        </p>
                    </Col>
                    {stats?.map(({ icon, title, value }) => (
                        <Col className='coin-stats' key={title}>
                            <Col className='coin-stats-name'>
                                <Text>{icon}</Text>
                                <Text>{title}</Text>
                            </Col>
                            <Col className='stats'>
                                {value}
                            </Col>
                        </Col>
                    ))}
                </Col>
                <Col className='other-stats-info'>
                    <Col className='coin-value-statistics-heading'>
                        <Title level={3} className='coin-details-heading'>
                            Other Statistics
                        </Title>
                        <p>
                            An overview showing the stats of all cryptocurrencies
                        </p>
                    </Col>
                    {genericStats?.map(({ icon, title, value }) => (
                        <Col className='coin-stats' key={title}>
                            <Col className='coin-stats-name'>
                                <Text>{icon}</Text>
                                <Text>{title}</Text>
                            </Col>
                            <Col className='stats'>
                                {value}
                            </Col>
                        </Col>
                    ))}
                </Col>
            </Col>
            <Row>
                <Title level={3} className='coin-details-heading'>
                    Top 10 Exchanges to trade {cryptoDetails.name}
                </Title>
                {exchangesList?.map((exchange) => (
                    <Col span={24} key={exchange.uuid}>
                        <Collapse>
                            <Panel
                                key={exchange.uuid}
                                showArrow={false}
                                header={(
                                    <Row key={exchange.uuid}>
                                        <Text><strong>{exchange.rank}.</strong></Text>
                                        <Avatar className="exchange-image" src={exchange.iconUrl} />
                                        <Text><strong>{exchange.name}</strong></Text>
                                    </Row>
                                )}
                            >
                                <Row>
                                    <Col xs={24} sm={12} lg={6}><Statistic title={'Price'} value={millify(exchange?.price)} /></Col>
                                    <Col xs={24} sm={12} lg={6}><Statistic title={'Markets'} value={millify(exchange?.numberOfMarkets)} /></Col>
                                    <Col xs={24} sm={12} lg={6}><Statistic title={'24h Volume'} value={millify(exchange?.['24hVolume'])} /></Col>
                                    <Col xs={24} sm={6} lg={3}><Statistic title={'Recommended'} value={exchange?.recommended ? 'Yes' : 'No'} /></Col>
                                    <Col xs={24} sm={6} lg={3}><Statistic title={'Verified'} value={exchange?.verified ? 'Yes' : 'No'} /></Col>
                                    <Col span={24}>
                                        <a href={exchange?.coinrankingUrl} target={'_blank'} rel='noreferrer'>{exchange.name} on Coin Ranking</a>
                                    </Col>
                                </Row>
                            </Panel>
                        </Collapse>
                    </Col>
                ))}
            </Row>
            <Col className='coin-desc-link'>
                <Row className='coin-desc'>
                    <Title level={3} className='coin-details-heading'>
                        What is {cryptoDetails.name}?
                        {HTMLReactParser(cryptoDetails.description)}
                    </Title>
                </Row>
                <Col className='coin-links'>
                    <Title level={3} className='coin-details-heading'>
                        {cryptoDetails.name} Links
                    </Title>
                    {cryptoDetails?.links?.map((link) => (
                        <Row className='coin-link' key={link.name}>
                            <Title level={5} className='link-name'>
                                {link.type}
                            </Title>
                            <a href={link.url} target={'_blank'} rel='noreferrer'>
                                {link.name}
                            </a>
                        </Row>
                    ))}
                </Col>
            </Col>
        </Col>
    );
};

export default CryptoDetails;
