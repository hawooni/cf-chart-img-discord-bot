export class JsonResponse extends Response {
  constructor(body, init) {
    super(
      JSON.stringify(body),
      init || {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }
    )
  }
}
