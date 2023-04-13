import { SimplePubSub } from '../src/SimplePubSub'
describe('SimplePubSub', () => {
  let callBack = jest.fn()
  let pubSub = new SimplePubSub()
  beforeEach(() => {
    callBack = jest.fn()
    pubSub = new SimplePubSub()
    pubSub.subscribe(callBack)
  })
  it('subscribe and calls', () => {
    expect(callBack).toBeCalledTimes(0)
    pubSub.publish()
    expect(callBack).toBeCalledTimes(1)
  })

  it("unsubscribe and doesn't call", () => {
    pubSub.unsubscribe(callBack)
    pubSub.publish()
    expect(callBack).toBeCalledTimes(0)
  })
})
