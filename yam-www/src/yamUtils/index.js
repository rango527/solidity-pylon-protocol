export const getPoolContracts = async (yam) => {
  const pools = Object.keys(yam.contracts)
    .filter(c => c.indexOf('_pool') !== -1)
    .reduce((acc, cur) => {
      const newAcc = { ...acc }
      newAcc[cur] = yam.contracts[cur]
      return newAcc
    }, {})
    //.map(k => yam.contracts[k])
  return pools
}

export const getEarned = async (yam, pool, account) => {
  return yam.toBigN(await pool.methods.earned(account).call()).div(10**18).toFixed(2)
}

export const getStaked = async (yam, pool, account) => {
  return yam.toBigN(await pool.methods.balanceOf(account).call()).div(10**18).toFixed(2)
}

export const getCurrentPrice = async (yam) => {
  // FORBROCK: get current YAM price
  return yam.toBigN(await yam.contracts.rebaser.methods.getCurrentTWAP().call()).toFixed(2);
}

const getTargetPrice = async (yam) => {
  // FORBROCK: get target YAM price
  return 0
}

const getCirculatingSupply = async (yam) => {
  // FORBROCK: get circulating supply
  return 0
}

const getNextRebaseTimestamp = async (yam) => {
  // FORBROCK: get next rebase timestamp
  return 0
}

const getTotalSupply = async (yam) => {
  // FORBROCK: get total supply
  return 0
}

export const getStats = async (yam) => {
  const curPrice = await getCurrentPrice(yam)
  const circSupply = await getCirculatingSupply(yam)
  const nextRebase = await getNextRebaseTimestamp(yam)
  const targetPrice = await getTargetPrice(yam)
  const totalSupply = await getTotalSupply(yam)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}
