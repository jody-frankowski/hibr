.PHONY: back front rp

back:
	make -C $@ run

front:
	make -C $@ run

rp:
	make -C $@ run

run: back front rp
