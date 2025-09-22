type event_kind = Trade | Quote | Book

type t = {
  ts_ns : int64;
  seq : int64;
  kind : event_kind;
  payload : string;
}

val compare : t -> t -> int
