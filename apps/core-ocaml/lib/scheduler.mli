type 's handler = 's -> Event.t -> 's

type t

val empty : unit -> t
val of_list : Event.t list -> t
val push : t -> Event.t -> unit
val pop_next : t -> Event.t option

val run : ?governor:Speed_governor.t -> t -> 's -> handler:'s handler -> unit
