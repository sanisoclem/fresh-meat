
export type Ledger = {
  id: string;
  name: string;
}

const MOCK_LEDGERS = [{
  id: 'test',
  name: 'Test Ledger'
}];

export const getLedgers = async () => {
  return await Promise.resolve(MOCK_LEDGERS);
}

export const getLedgerById = async(id: string) => {
  return await Promise.resolve(MOCK_LEDGERS.find(r=> r.id === id));
}