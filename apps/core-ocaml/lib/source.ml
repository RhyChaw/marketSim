let demo_events ~count ~spacing_ns =
  let rec build acc i seq ts =
    if i >= count then List.rev acc
    else
      let kind = match i mod 3 with 0 -> Event.Trade | 1 -> Event.Quote | _ -> Event.Book in
      let ev = { Event.ts_ns = ts; seq; kind; payload = "{}" } in
      let ts' = Int64.add ts spacing_ns in
      let seq' = Int64.succ seq in
      build (ev :: acc) (i+1) seq' ts'
  in
  build [] 0 0L 0L
