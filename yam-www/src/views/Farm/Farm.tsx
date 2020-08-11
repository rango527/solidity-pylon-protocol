import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { useParams } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import Button from '../../components/Button'
import Card from '../../components/Card'
import CardContent from '../../components/CardContent'
import CardIcon from '../../components/CardIcon'
import IconButton from '../../components/IconButton'
import Label from '../../components/Label'
import PageHeader from '../../components/PageHeader'

import { AddIcon, RemoveIcon } from '../../components/icons'

import useAllowance from '../../hooks/useAllowance'
import useApprove from '../../hooks/useApprove'
import useEarnings from '../../hooks/useEarnings'
import useFarm from '../../hooks/useFarm'
import useModal from '../../hooks/useModal'
import useRedeem from '../../hooks/useRedeem'
import useReward from '../../hooks/useReward'
import useStake from '../../hooks/useStake'
import useStakedBalance from '../../hooks/useStakedBalance'
import useTokenBalance from '../../hooks/useTokenBalance'
import useUnstake from '../../hooks/useUnstake'

import { getDisplayBalance } from '../../utils/formatBalance'
import { getContract } from '../../utils/erc20'

import DepositModal from './components/DepositModal'
import WithdrawModal from './components/WithdrawModal'

const Farm: React.FC = () => {
  const [requestedApproval, setRequestedApproval] = useState(false)

  const { farmId } = useParams()
  const {
    contract,
    depositToken,
    depositTokenAddress,
    earnToken,
    name,
    icon,
  } = useFarm(farmId) || {
    depositToken: '',
    depositTokenAddress: '',
    earnToken: '',
    name: '',
    icon: ''
  }

  const { ethereum } = useWallet()

  const tokenContract = useMemo(() => {
    return getContract(ethereum as provider, depositTokenAddress)
  }, [ethereum, depositTokenAddress])

  const allowance = useAllowance(tokenContract, contract)
  const { onApprove } = useApprove(tokenContract, contract)
  const earnings = useEarnings(contract)
  const tokenBalance = useTokenBalance(depositTokenAddress)
  const stakedBalance = useStakedBalance(contract)
  const { onStake } = useStake(contract)
  const { onUnstake } = useUnstake(contract)
  const { onRedeem } = useRedeem(contract)
  const { onReward } = useReward(contract)

  const [onPresentDeposit] = useModal(<DepositModal max={tokenBalance} onConfirm={onStake} tokenName={depositToken} />)
  const [onPresentWithdraw] = useModal(<WithdrawModal max={stakedBalance} onConfirm={onUnstake} tokenName={depositToken} />)

  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      const txHash = await onApprove()
      // user rejected tx or didn't go thru
      if (!txHash) {
        setRequestedApproval(false)
      }
    } catch (e) {
      console.log(e)
    }
  }, [onApprove, setRequestedApproval])

  return (
    <>
      <PageHeader
        icon={icon}
        subtitle={`Deposit ${depositToken.toUpperCase()} and earn ${earnToken.toUpperCase()}`}
        title={name}
      />
      <StyledFarm>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <Card>
              <CardContent>
                <StyledCardContentInner>
                  <StyledCardHeader>
                    <CardIcon>🌱</CardIcon>
                    <StyledValue>{getDisplayBalance(stakedBalance)}</StyledValue>
                    <Label text={`${depositToken.toUpperCase()} Staked`} />
                  </StyledCardHeader>
                  <StyledCardActions>
                    {!allowance.toNumber() ? (
                      <Button
                        disabled={requestedApproval}
                        onClick={handleApprove}
                        text={`Approve ${depositToken.toUpperCase()}`}
                      />
                    ) : (
                      <>
                        <IconButton onClick={onPresentWithdraw}>
                          <RemoveIcon />
                        </IconButton>
                        <StyledActionSpacer />
                        <IconButton onClick={onPresentDeposit}>
                          <AddIcon />
                        </IconButton>
                      </>
                    )}
                  </StyledCardActions>
                </StyledCardContentInner>
              </CardContent>
            </Card>
          </StyledCardWrapper>

          <StyledCardSpacer />

          <StyledCardWrapper>
            <Card>
              <CardContent>
                <StyledCardContentInner>
                  <StyledCardHeader>
                    <CardIcon>🍠</CardIcon>
                    <StyledValue>{getDisplayBalance(earnings)}</StyledValue>
                    <Label text={`${earnToken.toUpperCase()} Earned`} />
                  </StyledCardHeader>
                  <StyledCardActions>
                      <Button onClick={onReward} text="Harvest" disabled={!earnings.toNumber()} />
                      <StyledCardSpacer />
                      <Button onClick={onRedeem} text="Harvest & Exit" disabled={!earnings.toNumber()} />
                  </StyledCardActions>
                </StyledCardContentInner>
              </CardContent>
            </Card>
          </StyledCardWrapper>
        </StyledCardsWrapper>
      </StyledFarm>
    </>
  )
}

const StyledFarm = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
`

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`

const StyledCardSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

const StyledValue = styled.span`
  color: ${props => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${props => props.theme.spacing[6]}px;
  width: 100%;
`
const StyledActionSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

export default Farm
