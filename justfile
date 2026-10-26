[parallel]
run: back front rp

back:
	just -f $@ run

front:
	make -C $@ run

rp:
	make -C $@ run
