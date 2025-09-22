let parse_speed () : float =
  let default = 10.0 in
  let env = try Some (Sys.getenv "SPEED") with Not_found -> None in
  match Array.to_list Sys.argv |> List.tl, env with
  | arg::_ , _ -> (try float_of_string arg with _ -> default)
  | [] , Some s -> (try float_of_string s with _ -> default)
  | _ -> default

let () =
  let speed = parse_speed () in
  let governor = Speed_governor.create ~speed in
  let events = Source.demo_events ~count:200 ~spacing_ns:1_000_000L in (* 1ms market spacing *)
  let sched = Scheduler.of_list events in
  let handler printed ev =
    let kind_s = match ev.Event.kind with Trade -> "trade" | Quote -> "quote" | Book -> "book" in
    Printf.printf "%Ld %Ld %s %s\n%!" ev.ts_ns ev.seq kind_s ev.payload;
    printed + 1
  in
  Scheduler.run ~governor sched 0 ~handler;
  ()
