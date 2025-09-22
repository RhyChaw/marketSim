type 's handler = 's -> Event.t -> 's

type t = { mutable queue : Event.t list }

let empty () = { queue = [] }
let of_list lst = { queue = List.sort Event.compare lst }

let push t ev =
  (* insert keeping sorted order; O(n) but fine for skeleton *)
  let rec insert acc = function
    | [] -> List.rev_append acc [ev]
    | x :: xs as l ->
      if Event.compare ev x <= 0 then List.rev_append acc (ev :: l)
      else insert (x :: acc) xs
  in
  t.queue <- insert [] t.queue

let pop_next t =
  match t.queue with
  | [] -> None
  | x :: xs -> t.queue <- xs; Some x

let nanos_to_seconds (ns:int64) : float = (Int64.to_float ns) /. 1e9

let run ?governor t s0 ~handler =
  let rec loop state last_market =
    match pop_next t with
    | None -> ()
    | Some ev ->
      (match governor with
      | None -> ()
      | Some g ->
        let sleep_ns = Speed_governor.compute_sleep_ns g ~last_market ~next_market:ev.ts_ns in
        if sleep_ns > 0L then Unix.sleepf (nanos_to_seconds sleep_ns));
      let state' = handler state ev in
      loop state' ev.ts_ns
  in
  let initial_market = match pop_next t with
    | None -> Int64.zero
    | Some ev -> (* process first immediately and continue *)
      let state' = handler s0 ev in
      loop state' ev.ts_ns; Int64.zero
  in
  ignore initial_market
