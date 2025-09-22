type t = {
  mutable speed : float;
  mutable start_market_ns : int64 option;
  mutable start_wall_ns : int64 option;
}

let create ~speed = { speed; start_market_ns=None; start_wall_ns=None }
let set_speed t s = t.speed <- (if s <= 0. then 1.0 else s)
let current_speed t = t.speed

let compute_sleep_ns t ~last_market ~next_market : int64 =
  let open Int64 in
  let now_wall = Clock.now_ns () in
  (match t.start_market_ns, t.start_wall_ns with
  | None, _ -> t.start_market_ns <- Some last_market
  | _ -> ());
  (match t.start_wall_ns with
  | None -> t.start_wall_ns <- Some now_wall
  | _ -> ());
  let start_market = Option.get t.start_market_ns in
  let start_wall = Option.get t.start_wall_ns in
  let market_delta = sub next_market start_market in
  let desired_wall_delta =
    let f = (Float.of_int64 market_delta) /. t.speed in
    Int64.of_float f
  in
  let target_wall = add start_wall desired_wall_delta in
  let remaining = sub target_wall now_wall in
  if remaining <= 0L then 0L else remaining
