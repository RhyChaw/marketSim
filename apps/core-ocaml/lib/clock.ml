let now_ns () : int64 =
  (* Prefer monotonic clock when available *)
  let secs =
    try Unix.clock_gettime Unix.CLOCK_MONOTONIC with _ -> Unix.gettimeofday ()
  in
  Int64.of_float (secs *. 1e9)
