import { inferItemsLostFromNarrative } from '../itemLossInference';
import { createMockInventoryItem } from '@/lib/test-utils';

describe('inferItemsLostFromNarrative', () => {
  it('returns empty when no loss verbs are present', () => {
    const inventory = [createMockInventoryItem({ name: 'Rusted Knife' })];
    const result = inferItemsLostFromNarrative(
      'You polish the rusted knife and check its edge.',
      inventory
    );

    expect(result).toEqual([]);
  });

  it('infers dropped items from narrative content', () => {
    const inventory = [createMockInventoryItem({ name: 'Conduit Tap' })];
    const result = inferItemsLostFromNarrative(
      'The Conduit Tap clatters away as you drop it into the wreckage.',
      inventory
    );

    expect(result).toEqual([
      { name: 'Conduit Tap', quantity: 1, lossReason: 'dropped' },
    ]);
  });

  it('infers consumed items when verbs indicate usage', () => {
    const inventory = [createMockInventoryItem({ name: 'Health Potion', stackable: true, quantity: 3 })];
    const result = inferItemsLostFromNarrative(
      'You drink the health potion and steady your breathing.',
      inventory
    );

    expect(result).toEqual([
      { name: 'Health Potion', quantity: 1, lossReason: 'consumed' },
    ]);
  });

  it('tracks Chinese confiscation without removing another item in the passage', () => {
    const inventory = ['梁信', '马灯'].map((name) => createMockInventoryItem({ name }));
    expect(inferItemsLostFromNarrative('稽查从你内袋拿走梁信，收进公文袋。你提起马灯。', inventory))
      .toEqual([{ name: '梁信', quantity: 1, lossReason: 'stolen' }]);
  });

  it('removes the actual number of Chinese coins paid', () => {
    const inventory = [createMockInventoryItem({ name: '铜板', stackable: true, quantity: 12 })];
    expect(inferItemsLostFromNarrative('你把六枚铜板交给跑差。', inventory))
      .toEqual([{ name: '铜板', quantity: 6, lossReason: 'delivered' }]);
  });

  it.each([
    '稽查没有收走你的梁信。',
    '你打算把梁信交给稽查。',
    '如果稽查收走梁信，你就去找老周。',
    '你想起昨天梁信被收走的事。',
    '跑差把六枚铜板交还给你。',
  ])('does not turn negation, plans, memories, or incoming items into losses: %s', (content) => {
    const inventory = ['梁信', '铜板'].map((name) => createMockInventoryItem({ name }));
    expect(inferItemsLostFromNarrative(content, inventory)).toEqual([]);
  });

  it('binds English losses to their clause instead of every mentioned item', () => {
    const inventory = ['Rope', 'Lantern'].map((name) => createMockInventoryItem({ name }));
    expect(inferItemsLostFromNarrative('You drop the rope. You check the lantern.', inventory))
      .toEqual([{ name: 'Rope', quantity: 1, lossReason: 'dropped' }]);
  });

  it('recognizes a completed Chinese handover narrated across clauses', () => {
    const inventory = [createMockInventoryItem({ name: '风干芥菜' })];
    expect(inferItemsLostFromNarrative(
      '你把那捆风干芥菜从随身袋里取出来，双手递过去。罗栗接过去，把它挂到炉门边的铁钩上。',
      inventory
    )).toEqual([{ name: '风干芥菜', quantity: 1, lossReason: 'delivered' }]);
  });

  it.each([
    '你把风干芥菜放在桌上，拿起面包递过去。她接过去吃了。',
    '你打算把风干芥菜取出来，双手递过去，让她接过去。',
    '罗栗把她的风干芥菜从袋里取出来，双手递过去。别人接过去。',
  ])('does not bind another object, a plan or NPC property to a cross-clause loss: %s', (content) => {
    expect(inferItemsLostFromNarrative(content, [createMockInventoryItem({ name: '风干芥菜' })])).toEqual([]);
  });
});
