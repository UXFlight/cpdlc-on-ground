# coding: utf-8

# =========================================================================
# echo_example.py
#
# Copyright (c) the Contributors as noted in the AUTHORS file.
# This file is part of Ingescape, see https://github.com/zeromq/ingescape.
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# =========================================================================


import ingescape as igs


class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class Echo(metaclass=Singleton):
    def __init__(self):
        # inputs
        self.boolI = None
        self.exp_t_c = None
        self.t_c = None

        # outputs
        self._exp_taxi_clearance = False
        self._engine_startup = False
        self._pushback = False
        self._taxi_clearance = False
        self._de_icing = False
        self._load = False
        self._wilco = False
        self._execute = False
        self._cancel = False
        self._standby = False
        self._unable = False

    # outputs
    @property
    def Exp_Taxi_Clearance(self):
        return self._exp_taxi_clearance

    @Exp_Taxi_Clearance.setter
    def Exp_Taxi_Clearance(self, value):
        self._exp_taxi_clearance = value
        if self._exp_taxi_clearance is not None:
            igs.output_set_bool("Expected_Taxi_Clearance", self._exp_taxi_clearance)

    @property
    def Engine_Startup(self):
        return self._engine_startup

    @Engine_Startup.setter
    def Engine_Startup(self, value):
        self._engine_startup = value
        if self._engine_startup is not None:
            igs.output_set_bool("Engine_Startup", self._engine_startup)
            
    @property
    def Pushback(self):
        return self._pushback

    @Pushback.setter
    def Pushback(self, value):
        self._pushback = value
        if self._pushback is not None:
            igs.output_set_bool("Pushback", self._pushback)
            
    @property
    def Taxi_Clearance(self):
        return self._taxi_clearance

    @Taxi_Clearance.setter
    def Taxi_Clearance(self, value):
        self._taxi_clearance = value
        if self._taxi_clearance is not None:
            igs.output_set_bool("Taxi_Clearance", self._taxi_clearance)

    @property
    def De_Icing(self):
        return self._de_icing

    @De_Icing.setter
    def De_Icing(self, value):
        self._de_icing = value
        if self._de_icing is not None:
            igs.output_set_bool("De_Icing", self._de_icing)
            
    @property
    def Load(self):
        return self._load

    @Load.setter
    def Load(self, value):
        self._load = value
        if self._load is not None:
            igs.output_set_bool("Load", self._load)
            
    @property
    def Wilco(self):
        return self._wilco

    @Wilco.setter
    def Wilco(self, value):
        self._wilco = value
        if self._wilco is not None:
            igs.output_set_bool("Wilco", self._wilco)
            
    @property
    def Execute(self):
        return self._execute

    @Execute.setter
    def Execute(self, value):
        self._execute = value
        if self._execute is not None:
            igs.output_set_bool("Execute", self._execute)
            
    @property
    def Cancel(self):
        return self._cancel

    @Cancel.setter
    def Cancel(self, value):
        self._cancel = value
        if self._cancel is not None:
            igs.output_set_bool("Cancel", self._cancel)
            
    @property
    def Standby(self):
        return self._standby

    @Standby.setter
    def Standby(self, value):
        self._standby = value
        if self._standby is not None:
            igs.output_set_bool("Standby", self._standby)
            
    @property
    def Unable(self):
        return self._unable

    @Unable.setter
    def Unable(self, value):
        self._unable = value
        if self._unable is not None:
            igs.output_set_bool("Unable", self._unable)



    # services
    def receive_values(self, sender_agent_name, sender_agent_uuid, boolV, integer, double, string, data, token, my_data):
        igs.info(f"Service receive_values called by {sender_agent_name} ({sender_agent_uuid}) with argument_list {boolV, integer, double, string, data} and token '{token}''")

    def send_values(self, sender_agent_name, sender_agent_uuid, token, my_data):
        print(f"Service send_values called by {sender_agent_name} ({sender_agent_uuid}), token '{token}' sending values : {self.boolO, self.integerO, self.doubleO, self.stringO, self.dataO}")
        igs.info(sender_agent_uuid, "receive_values", (self.boolO, self.integerO, self.doubleO, self.stringO, self.dataO), token)