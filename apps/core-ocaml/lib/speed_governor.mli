type t

val create : speed:float -> t
val set_speed : t -> float -> unit
val current_speed : t -> float

(* Computes how long to sleep (ns) before processing next_market event to maintain speed. *)
val compute_sleep_ns : t -> last_market:int64 -> next_market:int64 -> int64
