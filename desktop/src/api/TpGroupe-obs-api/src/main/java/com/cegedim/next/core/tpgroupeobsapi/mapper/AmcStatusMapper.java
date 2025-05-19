package com.cegedim.next.core.tpgroupeobsapi.mapper;

import com.cegedim.next.core.tpgroupeobsapi.dto.AmcStatusDTO;
import com.cegedim.next.core.tpgroupeobsapi.dto.ServiceProviderDTO;
import com.cegedim.next.core.tpgroupeobsapi.entity.AmcStatus;
import com.cegedim.next.core.tpgroupeobsapi.entity.ServiceProvider;

public class AmcStatusMapper {
    public static AmcStatusDTO mapToAmcStatusDTO(AmcStatus amcStatus) {
        if (amcStatus == null) return null;
        return new AmcStatusDTO(
                amcStatus.getNumAmcOtp(),
                amcStatus.getLabelAmcOtp(),
                amcStatus.getTypeConv(),
                amcStatus.getCritereSecondaire(),
                amcStatus.getInterAmc(),
                amcStatus.getInscritPF(),
                amcStatus.getSelInterAmc()
        );
    }

    public static AmcStatus mapToAmcStatus(AmcStatusDTO amcStatusDTO) {
        if (amcStatusDTO == null) return null;
        return new AmcStatus(
                amcStatusDTO.getNumAmcOtp(),
                amcStatusDTO.getLabelAmcOtp(),
                amcStatusDTO.getConvType(),
                amcStatusDTO.getSecondaryCriteria(),
                amcStatusDTO.getInterAmc(),
                amcStatusDTO.getInscritPF(),
                amcStatusDTO.getSelInterAmc()
        );
    }
}
